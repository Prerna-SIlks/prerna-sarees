"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      
      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl font-serif font-bold text-primary mb-12 text-center">Contact Us</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* Contact Info & Map */}
        <div className="space-y-8">
          <Card className="border-none shadow-none bg-background">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Visit Our Store</h3>
                  <p className="text-muted-foreground mt-1">
                    Prerna Sarees<br />
                    Javali Sal<br />
                    Hubli 580020, Karnataka, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Call Us</h3>
                  <a href="tel:+918660087544" className="text-muted-foreground hover:text-primary mt-1">+91 8660087544</a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <MessageCircle className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">WhatsApp</h3>
                  <a href="https://wa.me/918660087544?text=Hi,%20I'm%20interested%20in%20your%20sarees!" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary mt-1">+91 8660087544</a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Email Us</h3>
                  <a href="mailto:prernasilks@gmail.com" className="text-muted-foreground hover:text-primary mt-1">prernasilks@gmail.com</a>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d15383.692398418525!2d75.1325!3d15.3647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d70000000001%3A0x0!2sJavali%20Sal%2C%20Hubli!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Prerna Sarees Location"
            />
          </div>
        </div>

        {/* Contact Form */}
        <Card className="border-border">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-serif text-primary mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Priya Sharma" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" required placeholder="priya@example.com" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea id="message" name="message" required placeholder="How can we help you today?" className="min-h-[120px] resize-none" />
              </div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
              {status === "success" && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">Message sent successfully! We will get back to you soon.</p>
              )}
              {status === "error" && (
                <p className="text-sm text-destructive mt-2 text-center">Something went wrong. Please try again or contact us via WhatsApp.</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
