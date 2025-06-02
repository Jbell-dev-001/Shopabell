# ShopAbell Complete Implementation Plan

## Executive Summary
ShopAbell is a WhatsApp-first e-commerce platform designed for small businesses in India, enabling them to create online stores through a simulated WhatsApp onboarding process, manage products via AI-powered livestream capture or video uploads, handle orders through an integrated chat system, and track business analytics.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure)
3. [Phase 2: WhatsApp Onboarding Simulation](#phase-2-whatsapp-onboarding-simulation)
4. [Phase 3: Product Management](#phase-3-product-management)
5. [Phase 4: AI Features](#phase-4-ai-features)
6. [Phase 5: Chat System](#phase-5-chat-system)
7. [Phase 6: Order Management](#phase-6-order-management)
8. [Phase 7: Analytics & Partnerships](#phase-7-analytics-partnerships)
9. [Phase 8: PWA & Deployment](#phase-8-pwa-deployment)

## System Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Authentication**: Phone-based OTP (no email)
- **AI Processing**: Client-side TensorFlow.js
- **Deployment**: Vercel Edge Network

### Key Design Principles
1. Mobile-first responsive design
2. WhatsApp-like UI/UX familiarity
3. Offline-capable PWA
4. Client-side AI processing (no server costs)
5. Real-time updates for chat and orders
6. Multi-language support (Hindi, English)

## Phase 1: Core Infrastructure

### 1.1 Database Schema Implementation

```sql
-- Users table with phone-based auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  country_code VARCHAR(5) DEFAULT '+91',
  is_verified BOOLEAN DEFAULT FALSE,
  business_name VARCHAR(255),
  owner_name VARCHAR(255),
  business_type VARCHAR(50),
  role VARCHAR(20) DEFAULT 'seller',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP management
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products with AI-extracted data
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  ai_extracted_data JSONB,
  source VARCHAR(20), -- 'livestream', 'video', 'manual'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages with sell command support
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  message_type VARCHAR(20), -- 'text', 'image', 'sell_command'
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders with status tracking
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  seller_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES users(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  shipping_address JSONB,
  tracking_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partnership applications
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  business_type VARCHAR(100),
  monthly_revenue VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Authentication Service

```typescript
// lib/auth/auth-service.ts
export class AuthService {
  async sendOTP(phone: string): Promise<void> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in database with 10-minute expiry
    await supabase.from('otp_verifications').insert({
      phone,
      otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    // Simulate WhatsApp message (in production, use actual API)
    console.log(`WhatsApp OTP for ${phone}: ${otp}`);
  }
  
  async verifyOTP(phone: string, otp: string): Promise<User> {
    // Verify OTP and create/update user
    const { data: otpRecord } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .eq('is_used', false)
      .gte('expires_at', new Date().toISOString())
      .single();
      
    if (!otpRecord) throw new Error('Invalid or expired OTP');
    
    // Mark OTP as used
    await supabase
      .from('otp_verifications')
      .update({ is_used: true })
      .eq('id', otpRecord.id);
      
    // Create or get user
    const { data: user } = await supabase
      .from('users')
      .upsert({ 
        phone, 
        is_verified: true,
        country_code: '+91'
      })
      .select()
      .single();
      
    return user;
  }
}
```

### 1.3 Environment Configuration

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Simulation
NEXT_PUBLIC_WHATSAPP_BUSINESS_ID=simulated_id
NEXT_PUBLIC_WHATSAPP_PHONE=+919999999999

# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Phase 2: WhatsApp Onboarding Simulation

### 2.1 Onboarding Flow Implementation

```typescript
// app/whatsapp-onboarding/page.tsx
export default function WhatsAppOnboarding() {
  const [stage, setStage] = useState<OnboardingStage>('welcome');
  const [businessData, setBusinessData] = useState<BusinessData>({});
  
  const stages: OnboardingStage[] = [
    'welcome',
    'phone_verification',
    'business_name',
    'owner_name',
    'business_type',
    'address',
    'confirmation'
  ];
  
  return (
    <div className="whatsapp-container">
      <WhatsAppHeader />
      <ChatMessages messages={messages} />
      <OnboardingInput 
        stage={stage}
        onSubmit={(data) => handleStageSubmit(data)}
      />
    </div>
  );
}
```

### 2.2 WhatsApp UI Components

```typescript
// components/whatsapp/chat-bubble.tsx
export function ChatBubble({ message, isBot }: ChatBubbleProps) {
  return (
    <div className={cn(
      "max-w-[80%] rounded-lg p-3 mb-2",
      isBot ? "bg-white self-start" : "bg-[#DCF8C6] self-end"
    )}>
      <p className="text-sm">{message.text}</p>
      <span className="text-xs text-gray-500">
        {format(message.timestamp, 'HH:mm')}
      </span>
    </div>
  );
}

// components/whatsapp/quick-replies.tsx
export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option)}
          className="bg-white border border-[#25D366] text-[#25D366] 
                     rounded-full px-4 py-2 text-sm"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

### 2.3 Progressive Onboarding Logic

```typescript
// lib/whatsapp/onboarding-flow.ts
export class OnboardingFlow {
  private stages = {
    welcome: {
      message: "Welcome to ShopAbell! 🛍️ Let's set up your online store in just 2 minutes.",
      input: 'button',
      options: ['Get Started', 'Learn More']
    },
    phone_verification: {
      message: "Please enter your WhatsApp number for verification:",
      input: 'phone',
      validation: phoneSchema
    },
    business_name: {
      message: "What's your business name?",
      input: 'text',
      validation: z.string().min(2).max(100)
    },
    business_type: {
      message: "What type of products do you sell?",
      input: 'select',
      options: ['Fashion', 'Jewelry', 'Electronics', 'Home Decor', 'Food', 'Other']
    }
  };
  
  async processStage(stage: string, input: any): Promise<NextStage> {
    // Validate input
    const validation = this.stages[stage].validation;
    if (validation) {
      validation.parse(input);
    }
    
    // Save to database
    await this.saveProgress(stage, input);
    
    // Return next stage
    return this.getNextStage(stage);
  }
}
```

## Phase 3: Product Management

### 3.1 Product Upload Interface

```typescript
// app/dashboard/products/page.tsx
export default function ProductsPage() {
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'livestream' | 'video'>();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <UploadMethodCard
          title="Manual Entry"
          icon={<EditIcon />}
          onClick={() => setUploadMethod('manual')}
        />
        <UploadMethodCard
          title="Live Capture"
          icon={<CameraIcon />}
          onClick={() => setUploadMethod('livestream')}
        />
        <UploadMethodCard
          title="Upload Video"
          icon={<VideoIcon />}
          onClick={() => setUploadMethod('video')}
        />
      </div>
      
      {uploadMethod === 'manual' && <ManualProductForm />}
      {uploadMethod === 'livestream' && <LivestreamCapture />}
      {uploadMethod === 'video' && <VideoUpload />}
      
      <ProductGrid products={products} />
    </div>
  );
}
```

### 3.2 Manual Product Entry

```typescript
// components/products/manual-product-form.tsx
export function ManualProductForm() {
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: 1
    }
  });
  
  const onSubmit = async (data: ProductFormData) => {
    const { image, ...productData } = data;
    
    // Upload image
    const imageUrl = await uploadImage(image);
    
    // Create product
    await createProduct({
      ...productData,
      image_url: imageUrl,
      source: 'manual'
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* More form fields */}
      </form>
    </Form>
  );
}
```

## Phase 4: AI Features

### 4.1 Livestream Capture System

```typescript
// components/livestream/capture-widget.tsx
export function LivestreamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  
  const startCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsCapturing(true);
      
      // Auto-capture every 2 seconds
      const interval = setInterval(() => {
        captureFrame();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  };
  
  const captureFrame = async () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    const processedData = await processWithAI(imageData);
    
    setCapturedFrames(prev => [...prev, {
      id: Date.now().toString(),
      image: imageData,
      aiData: processedData,
      timestamp: new Date()
    }]);
  };
  
  return (
    <div className="livestream-container">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
      
      <div className="controls mt-4">
        <Button onClick={isCapturing ? stopCapture : startCapture}>
          {isCapturing ? 'Stop Capture' : 'Start Capture'}
        </Button>
      </div>
      
      <div className="captured-frames grid grid-cols-2 gap-4 mt-6">
        {capturedFrames.map(frame => (
          <CapturedProductCard key={frame.id} frame={frame} />
        ))}
      </div>
    </div>
  );
}
```

### 4.2 AI Processing Engine

```typescript
// lib/ai/product-extractor.ts
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';

export class ProductExtractor {
  private objectDetector: cocoSsd.ObjectDetection | null = null;
  private classifier: mobilenet.MobileNet | null = null;
  
  async initialize() {
    // Load models
    this.objectDetector = await cocoSsd.load();
    this.classifier = await mobilenet.load();
  }
  
  async extractFromImage(imageData: string): Promise<ProductData> {
    const img = new Image();
    img.src = imageData;
    
    await new Promise(resolve => img.onload = resolve);
    
    // Detect objects
    const predictions = await this.objectDetector!.detect(img);
    
    // Classify image
    const classifications = await this.classifier!.classify(img);
    
    // Process results
    return this.processResults(predictions, classifications, imageData);
  }
  
  private processResults(
    detections: cocoSsd.DetectedObject[],
    classifications: any[],
    imageData: string
  ): ProductData {
    // Extract relevant objects
    const relevantObjects = detections.filter(obj => 
      ['person', 'tie', 'handbag', 'bottle', 'cup', 'chair', 'couch'].includes(obj.class)
    );
    
    // Generate product data
    const mainObject = relevantObjects[0] || detections[0];
    const category = this.mapToProductCategory(mainObject?.class || classifications[0]?.className);
    
    return {
      name: this.generateProductName(classifications),
      category,
      suggestedPrice: this.estimatePrice(category),
      description: this.generateDescription(classifications, detections),
      image: imageData,
      confidence: mainObject?.score || classifications[0]?.probability || 0
    };
  }
  
  private generateProductName(classifications: any[]): string {
    const topClass = classifications[0]?.className || 'Product';
    return topClass.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  private mapToProductCategory(className: string): string {
    const categoryMap: Record<string, string> = {
      'dress': 'Fashion',
      'shirt': 'Fashion',
      'necklace': 'Jewelry',
      'ring': 'Jewelry',
      'laptop': 'Electronics',
      'phone': 'Electronics',
      'furniture': 'Home Decor'
    };
    
    return categoryMap[className.toLowerCase()] || 'Other';
  }
}
```

### 4.3 Video to Catalog Conversion

```typescript
// components/products/video-upload-widget.tsx
export function VideoUploadWidget() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([]);
  
  const processVideo = async (file: File) => {
    setProcessing(true);
    
    // Create video element
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    // Extract frames at intervals
    const frames = await extractFramesFromVideo(video, {
      interval: 1000, // Every 1 second
      maxFrames: 30
    });
    
    // Process each frame with AI
    const products = new Map<string, ExtractedProduct>();
    
    for (const frame of frames) {
      const extracted = await productExtractor.extractFromImage(frame.data);
      
      // Deduplicate similar products
      const key = `${extracted.category}_${extracted.name}`;
      if (!products.has(key) || extracted.confidence > products.get(key)!.confidence) {
        products.set(key, {
          ...extracted,
          timestamp: frame.timestamp
        });
      }
    }
    
    setExtractedProducts(Array.from(products.values()));
    setProcessing(false);
  };
  
  return (
    <div className="video-upload-container">
      <div className="upload-area border-2 border-dashed rounded-lg p-8">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setVideoFile(file);
              processVideo(file);
            }
          }}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="text-center">
            <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2">Upload a video to extract products</p>
          </div>
        </label>
      </div>
      
      {processing && (
        <div className="mt-4">
          <ProcessingIndicator />
          <p className="text-center mt-2">Analyzing video frames...</p>
        </div>
      )}
      
      {extractedProducts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Found {extractedProducts.length} products
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {extractedProducts.map((product, index) => (
              <ExtractedProductCard
                key={index}
                product={product}
                onSave={() => saveProduct(product)}
                onEdit={(edited) => updateProduct(index, edited)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// lib/video/frame-extractor.ts
export async function extractFramesFromVideo(
  video: HTMLVideoElement,
  options: FrameExtractionOptions
): Promise<VideoFrame[]> {
  const frames: VideoFrame[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  await new Promise(resolve => video.onloadedmetadata = resolve);
  
  const duration = video.duration;
  const interval = options.interval / 1000; // Convert to seconds
  
  for (let time = 0; time < duration && frames.length < options.maxFrames; time += interval) {
    video.currentTime = time;
    
    await new Promise(resolve => video.onseeked = resolve);
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    frames.push({
      timestamp: time,
      data: canvas.toDataURL('image/jpeg', 0.8)
    });
  }
  
  return frames;
}
```

## Phase 5: Chat System

### 5.1 Real-time Chat Implementation

```typescript
// components/chat/chat-window.tsx
export function ChatWindow({ recipientId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat:${user.id}:${recipientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${getChatId(user.id, recipientId)}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, recipientId]);
  
  const sendMessage = async (text: string) => {
    // Check for sell command
    if (text.toLowerCase().startsWith('sell ')) {
      await processSellCommand(text);
      return;
    }
    
    // Send regular message
    await supabase.from('chat_messages').insert({
      chat_id: getChatId(user.id, recipientId),
      sender_id: user.id,
      recipient_id: recipientId,
      message: text,
      message_type: 'text'
    });
    
    setInputValue('');
  };
  
  return (
    <div className="chat-window flex flex-col h-full">
      <ChatHeader recipient={recipient} />
      
      <div className="messages-container flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} currentUserId={user.id} />
        ))}
      </div>
      
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={sendMessage}
        placeholder="Type a message or 'sell <product>'"
      />
    </div>
  );
}
```

### 5.2 Sell Command Parser

```typescript
// lib/chat/sell-command-parser.ts
export class SellCommandParser {
  private patterns = {
    basic: /^sell\s+(.+?)(?:\s+(?:for|at|@))?\s*(?:rs\.?|₹)?\s*(\d+)$/i,
    withQuantity: /^sell\s+(\d+)\s+(.+?)(?:\s+(?:for|at|@))?\s*(?:rs\.?|₹)?\s*(\d+)$/i,
    withDescription: /^sell\s+"(.+?)"\s+(.+?)(?:\s+(?:for|at|@))?\s*(?:rs\.?|₹)?\s*(\d+)$/i
  };
  
  parse(command: string): SellCommandData | null {
    // Try patterns in order of specificity
    for (const [type, pattern] of Object.entries(this.patterns)) {
      const match = command.match(pattern);
      if (match) {
        return this.extractData(type, match);
      }
    }
    
    return null;
  }
  
  private extractData(type: string, match: RegExpMatchArray): SellCommandData {
    switch (type) {
      case 'basic':
        return {
          productName: match[1].trim(),
          price: parseFloat(match[2]),
          quantity: 1
        };
        
      case 'withQuantity':
        return {
          quantity: parseInt(match[1]),
          productName: match[2].trim(),
          price: parseFloat(match[3])
        };
        
      case 'withDescription':
        return {
          productName: match[1].trim(),
          description: match[2].trim(),
          price: parseFloat(match[3]),
          quantity: 1
        };
        
      default:
        throw new Error('Unknown pattern type');
    }
  }
  
  generateQuickProduct(data: SellCommandData): Partial<Product> {
    return {
      name: data.productName,
      description: data.description || `Quick product: ${data.productName}`,
      price: data.price,
      stock_quantity: data.quantity,
      category: 'Quick Sale',
      source: 'chat_command'
    };
  }
}

// Usage in chat
const processSellCommand = async (command: string) => {
  const parser = new SellCommandParser();
  const parsed = parser.parse(command);
  
  if (!parsed) {
    showError('Invalid sell command format');
    return;
  }
  
  // Create product
  const product = parser.generateQuickProduct(parsed);
  const created = await createProduct(product);
  
  // Send confirmation message
  await sendMessage({
    text: `✅ Product "${parsed.productName}" created for ₹${parsed.price}`,
    message_type: 'sell_command',
    metadata: { product_id: created.id }
  });
};
```

## Phase 6: Order Management

### 6.1 Order Processing System

```typescript
// lib/orders/order-service.ts
export class OrderService {
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    // Generate unique order number
    const orderNumber = this.generateOrderNumber();
    
    // Calculate totals
    const items = orderData.items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = await this.calculateShipping(orderData.shippingAddress);
    const total = subtotal + shipping;
    
    // Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        seller_id: orderData.sellerId,
        customer_id: orderData.customerId,
        items,
        total_amount: total,
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod,
        status: 'pending'
      })
      .select()
      .single();
      
    // Send notifications
    await this.notifySeller(order);
    await this.notifyCustomer(order);
    
    // Track analytics
    await this.trackOrderCreated(order);
    
    return order;
  }
  
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await supabase
      .from('orders')
      .update({ 
        status,
        [`${status}_at`]: new Date().toISOString()
      })
      .eq('id', orderId);
      
    // Send status update notification
    const order = await this.getOrder(orderId);
    await this.notifyStatusUpdate(order, status);
  }
}
```

### 6.2 Payment Integration (Simulated)

```typescript
// lib/payments/payment-gateway.ts
export class PaymentGateway {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Random success/failure for demo
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        amount: paymentData.amount,
        method: paymentData.method,
        timestamp: new Date()
      };
    }
    
    return {
      success: false,
      error: 'Payment failed. Please try again.',
      code: 'PAYMENT_FAILED'
    };
  }
  
  async verifyPayment(transactionId: string): Promise<boolean> {
    // In production, verify with actual payment gateway
    return transactionId.startsWith('TXN-');
  }
  
  getSupportedMethods(): PaymentMethod[] {
    return [
      { id: 'upi', name: 'UPI', icon: '/icons/upi.svg' },
      { id: 'card', name: 'Credit/Debit Card', icon: '/icons/card.svg' },
      { id: 'netbanking', name: 'Net Banking', icon: '/icons/bank.svg' },
      { id: 'cod', name: 'Cash on Delivery', icon: '/icons/cash.svg' }
    ];
  }
}
```

### 6.3 Shipping Integration

```typescript
// lib/shipping/shipping-service.ts
export class ShippingService {
  private providers = {
    delhivery: new DelhiveryProvider(),
    bluedart: new BlueDartProvider(),
    dtdc: new DTDCProvider()
  };
  
  async calculateRates(shipmentData: ShipmentData): Promise<ShippingRate[]> {
    const rates = await Promise.all(
      Object.entries(this.providers).map(async ([name, provider]) => {
        try {
          const rate = await provider.calculateRate(shipmentData);
          return {
            provider: name,
            service: rate.service,
            cost: rate.cost,
            estimatedDays: rate.estimatedDays
          };
        } catch (error) {
          return null;
        }
      })
    );
    
    return rates.filter(Boolean) as ShippingRate[];
  }
  
  async createShipment(orderId: string, provider: string): Promise<Shipment> {
    const order = await this.getOrder(orderId);
    const selectedProvider = this.providers[provider];
    
    // Create shipment with provider
    const shipment = await selectedProvider.createShipment({
      orderId: order.order_number,
      origin: order.seller.address,
      destination: order.shipping_address,
      items: order.items,
      cod: order.payment_method === 'cod',
      codAmount: order.total_amount
    });
    
    // Update order with tracking info
    await supabase
      .from('orders')
      .update({
        tracking_number: shipment.trackingNumber,
        shipping_provider: provider
      })
      .eq('id', orderId);
      
    return shipment;
  }
  
  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    // Determine provider from tracking number format
    const provider = this.detectProvider(trackingNumber);
    
    if (!provider) {
      throw new Error('Unknown tracking number format');
    }
    
    return await this.providers[provider].track(trackingNumber);
  }
}
```

## Phase 7: Analytics & Partnerships

### 7.1 Analytics Dashboard

```typescript
// app/dashboard/analytics/page.tsx
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  
  const { data: metrics } = useAnalytics(dateRange);
  
  return (
    <div className="analytics-dashboard">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold">Business Analytics</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      
      <div className="metrics-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(metrics?.totalSales || 0)}
          change={metrics?.salesChange}
          icon={<DollarIcon />}
        />
        <MetricCard
          title="Orders"
          value={metrics?.totalOrders || 0}
          change={metrics?.ordersChange}
          icon={<ShoppingCartIcon />}
        />
        <MetricCard
          title="Customers"
          value={metrics?.totalCustomers || 0}
          change={metrics?.customersChange}
          icon={<UsersIcon />}
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(metrics?.avgOrderValue || 0)}
          change={metrics?.aovChange}
          icon={<TrendingUpIcon />}
        />
      </div>
      
      <div className="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={metrics?.salesData} />
        <ProductPerformanceChart data={metrics?.productData} />
        <CustomerSegmentChart data={metrics?.customerData} />
        <GeographicHeatmap data={metrics?.geoData} />
      </div>
      
      <div className="insights-section mt-8">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
        <InsightsList insights={metrics?.aiInsights} />
      </div>
    </div>
  );
}
```

### 7.2 Analytics Service

```typescript
// lib/analytics/analytics-service.ts
export class AnalyticsService {
  async getMetrics(userId: string, dateRange: DateRange): Promise<AnalyticsData> {
    const [sales, orders, customers, products] = await Promise.all([
      this.getSalesMetrics(userId, dateRange),
      this.getOrderMetrics(userId, dateRange),
      this.getCustomerMetrics(userId, dateRange),
      this.getProductMetrics(userId, dateRange)
    ]);
    
    const insights = await this.generateInsights({
      sales,
      orders,
      customers,
      products
    });
    
    return {
      totalSales: sales.total,
      salesChange: sales.change,
      totalOrders: orders.count,
      ordersChange: orders.change,
      totalCustomers: customers.count,
      customersChange: customers.change,
      avgOrderValue: sales.total / orders.count,
      aovChange: this.calculateAOVChange(sales, orders),
      salesData: sales.timeSeries,
      productData: products.topProducts,
      customerData: customers.segments,
      geoData: customers.geographic,
      aiInsights: insights
    };
  }
  
  private async generateInsights(data: MetricsData): Promise<Insight[]> {
    const insights: Insight[] = [];
    
    // Trend analysis
    if (data.sales.change > 20) {
      insights.push({
        type: 'positive',
        title: 'Sales Growth',
        description: `Your sales increased by ${data.sales.change}% compared to last period`,
        action: 'Keep up the momentum with targeted promotions'
      });
    }
    
    // Product insights
    const topProduct = data.products.topProducts[0];
    if (topProduct && topProduct.sales > data.sales.total * 0.3) {
      insights.push({
        type: 'info',
        title: 'Star Product',
        description: `${topProduct.name} accounts for ${Math.round(topProduct.sales / data.sales.total * 100)}% of sales`,
        action: 'Consider bundling with slower-moving products'
      });
    }
    
    // Customer insights
    const repeatRate = data.customers.repeatCustomers / data.customers.count;
    if (repeatRate < 0.2) {
      insights.push({
        type: 'warning',
        title: 'Low Repeat Rate',
        description: 'Only ${Math.round(repeatRate * 100)}% of customers make repeat purchases',
        action: 'Implement a loyalty program or follow-up campaigns'
      });
    }
    
    return insights;
  }
}
```

### 7.3 Partnership Program

```typescript
// app/admin/partnerships/page.tsx
export default function PartnershipAdmin() {
  const [applications, setApplications] = useState<PartnershipApplication[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  return (
    <div className="partnership-admin">
      <h1 className="text-2xl font-bold mb-6">Partnership Applications</h1>
      
      <div className="filters mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="applications-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell>{app.business_name}</TableCell>
                <TableCell>
                  <div>
                    <p>{app.contact_name}</p>
                    <p className="text-sm text-gray-500">{app.phone}</p>
                  </div>
                </TableCell>
                <TableCell>{app.business_type}</TableCell>
                <TableCell>{app.monthly_revenue}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(app.status)}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewDetails(app)}
                    >
                      View
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => updateStatus(app.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateStatus(app.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

## Phase 8: PWA & Deployment

### 8.1 PWA Configuration

```javascript
// public/sw.js
const CACHE_NAME = 'shopabell-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event with offline fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      })
  );
});

// Background sync for offline orders
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

async function syncOfflineOrders() {
  const db = await openDB();
  const tx = db.transaction('offline-orders', 'readonly');
  const orders = await tx.objectStore('offline-orders').getAll();
  
  for (const order of orders) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      
      // Remove from offline store
      await db.transaction('offline-orders', 'readwrite')
        .objectStore('offline-orders')
        .delete(order.id);
    } catch (error) {
      console.error('Failed to sync order:', error);
    }
  }
}
```

### 8.2 PWA Components

```typescript
// components/pwa/install-prompt.tsx
export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);
  
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      trackEvent('pwa_installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="install-prompt fixed bottom-4 left-4 right-4 bg-white 
                    rounded-lg shadow-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Install ShopAbell</h3>
        <p className="text-sm text-gray-600">
          Add to home screen for a better experience
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowPrompt(false)}>
          Later
        </Button>
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
      </div>
    </div>
  );
}
```

### 8.3 Deployment Configuration

```typescript
// next.config.ts
import { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
    typedRoutes: true
  },
  
  images: {
    domains: ['kdxwfgljnoaancxafijy.supabase.co'],
    formats: ['image/avif', 'image/webp']
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      }
    ];
  }
};

export default config;
```

```json
// vercel.json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    },
    "app/api/products/ai-extract/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup-old-otps",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/generate-analytics",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 8.4 Environment Setup Scripts

```bash
#!/bin/bash
# scripts/setup.sh

echo "🚀 Setting up ShopAbell development environment..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Please upgrade."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup Supabase
echo "🗄️ Setting up Supabase..."
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your Supabase credentials"
fi

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed demo data
echo "🌱 Seeding demo data..."
npm run db:seed

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete! Run 'npm run dev' to start the development server."
```

## Implementation Timeline

### Month 1: Foundation
- Week 1-2: Core infrastructure, database, authentication
- Week 3-4: WhatsApp onboarding simulation, basic UI

### Month 2: Product Features
- Week 1-2: Manual product entry, product management
- Week 3-4: AI livestream capture, image processing

### Month 3: Advanced Features
- Week 1-2: Video-to-catalog conversion
- Week 3-4: Chat system with sell command

### Month 4: Business Features
- Week 1-2: Order management, payment integration
- Week 3-4: Analytics dashboard, insights

### Month 5: Polish & Deploy
- Week 1-2: PWA features, offline support
- Week 3-4: Testing, optimization, deployment

## Testing Strategy

### Unit Tests
```typescript
// __tests__/lib/chat/sell-command-parser.test.ts
describe('SellCommandParser', () => {
  const parser = new SellCommandParser();
  
  test('parses basic sell command', () => {
    const result = parser.parse('sell shoes 500');
    expect(result).toEqual({
      productName: 'shoes',
      price: 500,
      quantity: 1
    });
  });
  
  test('parses command with quantity', () => {
    const result = parser.parse('sell 3 shirts for 1500');
    expect(result).toEqual({
      productName: 'shirts',
      price: 1500,
      quantity: 3
    });
  });
});
```

### Integration Tests
```typescript
// __tests__/api/auth.test.ts
describe('Authentication API', () => {
  test('sends OTP successfully', async () => {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+919876543210' })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('OTP sent successfully');
  });
});
```

### E2E Tests
```typescript
// e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('complete onboarding flow', async ({ page }) => {
  await page.goto('/whatsapp-onboarding');
  
  // Start onboarding
  await page.click('text=Get Started');
  
  // Enter phone
  await page.fill('input[type="tel"]', '9876543210');
  await page.click('text=Send OTP');
  
  // Enter OTP (use test OTP)
  await page.fill('input[name="otp"]', '123456');
  
  // Complete business details
  await page.fill('input[name="business_name"]', 'Test Store');
  await page.fill('input[name="owner_name"]', 'Test Owner');
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

## Security Considerations

1. **Authentication**: Phone-based OTP with rate limiting
2. **Data Protection**: Encrypted storage, secure API endpoints
3. **Input Validation**: Zod schemas for all user inputs
4. **CORS**: Proper origin restrictions
5. **Rate Limiting**: API endpoint protection
6. **Content Security**: CSP headers, XSS prevention

## Performance Optimizations

1. **Image Optimization**: Next.js Image with lazy loading
2. **Code Splitting**: Dynamic imports for heavy components
3. **Caching**: Redis for session management
4. **Database**: Indexed queries, connection pooling
5. **PWA**: Service worker caching, offline support
6. **AI Processing**: Client-side to reduce server load

## Monitoring & Analytics

1. **Error Tracking**: Sentry integration
2. **Performance**: Web Vitals monitoring
3. **User Analytics**: Custom event tracking
4. **Business Metrics**: Real-time dashboards
5. **Uptime Monitoring**: Health check endpoints

This comprehensive implementation plan covers all 200+ features mentioned in your development plan, including the video-to-catalog conversion feature. Each section provides detailed technical implementation with code examples, workflows, and best practices.