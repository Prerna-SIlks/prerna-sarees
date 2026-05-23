export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold text-primary mb-8 text-center">Shipping Policy</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground space-y-6">
        <p>At Prerna Sarees, we strive to deliver your beautiful ethnic wear safely and swiftly.</p>
        
        <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Delivery Across India</h2>
        <p>We are proud to offer shipping to all pin codes across India. Standard delivery typically takes 3-7 business days depending on your location.</p>
        
        <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Cash on Delivery (COD)</h2>
        <p>Yes, Cash on Delivery is available for all orders across India. Please ensure someone is available at the provided address to receive and pay for the package.</p>
        
        <h2 className="text-2xl font-serif text-foreground mt-8 mb-4">Order Tracking</h2>
        <p>Once your order is dispatched, you will receive a tracking link via email and SMS to monitor the status of your shipment.</p>
      </div>
    </div>
  );
}
