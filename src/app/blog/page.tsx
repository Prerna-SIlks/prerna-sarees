import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "The Ultimate Guide to Choosing Your Bridal Banarasi",
      excerpt: "Discover the intricate weaves and motifs that make Banarasi sarees the crown jewel of Indian weddings.",
      date: "October 12, 2023",
      image: "/images/products/saree-1.jpg"
    },
    {
      id: 2,
      title: "How to Care for Your Pure Silk Sarees",
      excerpt: "Expert tips on maintaining the luster and longevity of your delicate Kanjivaram and Chanderi silks.",
      date: "September 28, 2023",
      image: "/images/products/saree-2.jpg"
    },
    {
      id: 3,
      title: "Draping Styles: From Traditional to Modern",
      excerpt: "Learn how to drape your sarees in 5 unique ways to stand out at any festive occasion or party.",
      date: "September 15, 2023",
      image: "/images/products/saree-3.jpg"
    }
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <h1 className="text-4xl font-serif font-bold text-primary mb-12 text-center">Prerna Style Journal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <Card key={post.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-video w-full">
              <Image src={post.image} alt={post.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <div className="text-sm text-muted-foreground mb-2">{post.date}</div>
              <CardTitle className="font-serif text-xl line-clamp-2 hover:text-primary transition-colors">
                <Link href="#">{post.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base line-clamp-3">
                {post.excerpt}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
