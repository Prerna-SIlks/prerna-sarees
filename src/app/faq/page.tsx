import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
      <h1 className="text-4xl font-serif font-bold text-primary mb-8 text-center">Frequently Asked Questions</h1>
      
      <Accordion className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg">Do you offer Cash on Delivery (COD)?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Yes, we offer Cash on Delivery across all serviceable pin codes in India.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg">How long does delivery take?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Standard delivery takes between 3 to 7 business days, depending on your location in India.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg">What is your return policy?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            We have an easy 7-day return and exchange policy for items that are unused, unwashed, and have their original tags intact.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg">Where is your physical store located?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Our family boutique is located at Javali Sal Hubli 580020, Karnataka. We would love to host you!
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
