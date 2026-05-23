export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string;
  occasion: string;
  fabric: string;
  image_urls: string[];
  stock: number;
  created_at?: string;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    "id": "prod-1",
    "title": "Royal Blue Luxurious Silk Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue silk saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 19750,
    "category": "silk-sarees",
    "type": "Silk",
    "occasion": "Festive",
    "fabric": "Silk",
    "image_urls": [
      "/images/products/saree-2.jpg"
    ],
    "stock": 7
  },
  {
    "id": "prod-2",
    "title": "Silver Traditional Silk Saree",
    "description": "Discover the essence of Hubli's heritage with this silver silk saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 55758,
    "category": "silk-sarees",
    "type": "Silk",
    "occasion": "Festive",
    "fabric": "Silk",
    "image_urls": [
      "/images/products/saree-3.jpg"
    ],
    "stock": 7
  },
  {
    "id": "prod-3",
    "title": "Burgundy Vibrant Silk Saree",
    "description": "Discover the essence of Hubli's heritage with this burgundy silk saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 47963,
    "category": "silk-sarees",
    "type": "Silk",
    "occasion": "Festive",
    "fabric": "Silk",
    "image_urls": [
      "/images/products/saree-4.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-4",
    "title": "Ivory Premium Silk Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory silk saree. Featuring an premium drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 2190,
    "category": "silk-sarees",
    "type": "Silk",
    "occasion": "Festive",
    "fabric": "Silk",
    "image_urls": [
      "/images/products/saree-5.jpg"
    ],
    "stock": 5
  },
  {
    "id": "prod-5",
    "title": "Lavender Luxurious Silk Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender silk saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 68748,
    "category": "silk-sarees",
    "type": "Silk",
    "occasion": "Festive",
    "fabric": "Silk",
    "image_urls": [
      "/images/products/saree-6.jpg"
    ],
    "stock": 12
  },
  {
    "id": "prod-6",
    "title": "Pastel Pink Handwoven Silk Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink silk saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 71111,
    "category": "silk-sarees",
    "type": "Silk",
    "occasion": "Festive",
    "fabric": "Silk",
    "image_urls": [
      "/images/products/saree-7.jpg"
    ],
    "stock": 9
  },
  {
    "id": "prod-7",
    "title": "Ivory Premium Cotton Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory cotton saree. Featuring an premium drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 67721,
    "category": "cotton-sarees",
    "type": "Cotton",
    "occasion": "Casual",
    "fabric": "Cotton",
    "image_urls": [
      "/images/products/saree-8.jpg"
    ],
    "stock": 20
  },
  {
    "id": "prod-8",
    "title": "Royal Blue Classic Cotton Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue cotton saree. Featuring an classic drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 50656,
    "category": "cotton-sarees",
    "type": "Cotton",
    "occasion": "Casual",
    "fabric": "Cotton",
    "image_urls": [
      "/images/products/saree-9.jpg"
    ],
    "stock": 7
  },
  {
    "id": "prod-9",
    "title": "Mustard Yellow Classic Cotton Saree",
    "description": "Discover the essence of Hubli's heritage with this mustard yellow cotton saree. Featuring an classic drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 20793,
    "category": "cotton-sarees",
    "type": "Cotton",
    "occasion": "Casual",
    "fabric": "Cotton",
    "image_urls": [
      "/images/products/saree-10.jpg"
    ],
    "stock": 17
  },
  {
    "id": "prod-10",
    "title": "Gold Premium Cotton Saree",
    "description": "Discover the essence of Hubli's heritage with this gold cotton saree. Featuring an premium drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 4590,
    "category": "cotton-sarees",
    "type": "Cotton",
    "occasion": "Casual",
    "fabric": "Cotton",
    "image_urls": [
      "/images/products/saree-11.jpg"
    ],
    "stock": 3
  },
  {
    "id": "prod-11",
    "title": "Lavender Classic Cotton Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender cotton saree. Featuring an classic drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 71679,
    "category": "cotton-sarees",
    "type": "Cotton",
    "occasion": "Casual",
    "fabric": "Cotton",
    "image_urls": [
      "/images/products/saree-12.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-12",
    "title": "Ivory Handwoven Cotton Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory cotton saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 23065,
    "category": "cotton-sarees",
    "type": "Cotton",
    "occasion": "Casual",
    "fabric": "Cotton",
    "image_urls": [
      "/images/products/saree-13.jpg"
    ],
    "stock": 5
  },
  {
    "id": "prod-13",
    "title": "Lavender Luxurious Linen Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender linen saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 65093,
    "category": "linen-sarees",
    "type": "Linen",
    "occasion": "Casual",
    "fabric": "Linen",
    "image_urls": [
      "/images/products/saree-14.jpg"
    ],
    "stock": 15
  },
  {
    "id": "prod-14",
    "title": "Gold Modern Linen Saree",
    "description": "Discover the essence of Hubli's heritage with this gold linen saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 31430,
    "category": "linen-sarees",
    "type": "Linen",
    "occasion": "Casual",
    "fabric": "Linen",
    "image_urls": [
      "/images/products/saree-15.jpg"
    ],
    "stock": 3
  },
  {
    "id": "prod-15",
    "title": "Lavender Elegant Linen Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender linen saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 50858,
    "category": "linen-sarees",
    "type": "Linen",
    "occasion": "Casual",
    "fabric": "Linen",
    "image_urls": [
      "/images/products/saree-1.jpg"
    ],
    "stock": 9
  },
  {
    "id": "prod-16",
    "title": "Pastel Pink Elegant Linen Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink linen saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 31034,
    "category": "linen-sarees",
    "type": "Linen",
    "occasion": "Casual",
    "fabric": "Linen",
    "image_urls": [
      "/images/products/saree-2.jpg"
    ],
    "stock": 9
  },
  {
    "id": "prod-17",
    "title": "Crimson Red Vibrant Linen Saree",
    "description": "Discover the essence of Hubli's heritage with this crimson red linen saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 74593,
    "category": "linen-sarees",
    "type": "Linen",
    "occasion": "Casual",
    "fabric": "Linen",
    "image_urls": [
      "/images/products/saree-3.jpg"
    ],
    "stock": 13
  },
  {
    "id": "prod-18",
    "title": "Midnight Black Vibrant Linen Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black linen saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 20573,
    "category": "linen-sarees",
    "type": "Linen",
    "occasion": "Casual",
    "fabric": "Linen",
    "image_urls": [
      "/images/products/saree-4.jpg"
    ],
    "stock": 1
  },
  {
    "id": "prod-19",
    "title": "Crimson Red Traditional Banarasi Saree",
    "description": "Discover the essence of Hubli's heritage with this crimson red banarasi saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 69735,
    "category": "banarasi-sarees",
    "type": "Banarasi",
    "occasion": "Festive",
    "fabric": "Banarasi",
    "image_urls": [
      "/images/products/saree-5.jpg"
    ],
    "stock": 19
  },
  {
    "id": "prod-20",
    "title": "Burgundy Vibrant Banarasi Saree",
    "description": "Discover the essence of Hubli's heritage with this burgundy banarasi saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 32638,
    "category": "banarasi-sarees",
    "type": "Banarasi",
    "occasion": "Festive",
    "fabric": "Banarasi",
    "image_urls": [
      "/images/products/saree-6.jpg"
    ],
    "stock": 15
  },
  {
    "id": "prod-21",
    "title": "Royal Blue Classic Banarasi Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue banarasi saree. Featuring an classic drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 38398,
    "category": "banarasi-sarees",
    "type": "Banarasi",
    "occasion": "Festive",
    "fabric": "Banarasi",
    "image_urls": [
      "/images/products/saree-7.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-22",
    "title": "Mustard Yellow Traditional Banarasi Saree",
    "description": "Discover the essence of Hubli's heritage with this mustard yellow banarasi saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 32242,
    "category": "banarasi-sarees",
    "type": "Banarasi",
    "occasion": "Festive",
    "fabric": "Banarasi",
    "image_urls": [
      "/images/products/saree-8.jpg"
    ],
    "stock": 18
  },
  {
    "id": "prod-23",
    "title": "Emerald Green Luxurious Banarasi Saree",
    "description": "Discover the essence of Hubli's heritage with this emerald green banarasi saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 50471,
    "category": "banarasi-sarees",
    "type": "Banarasi",
    "occasion": "Festive",
    "fabric": "Banarasi",
    "image_urls": [
      "/images/products/saree-9.jpg"
    ],
    "stock": 7
  },
  {
    "id": "prod-24",
    "title": "Midnight Black Vibrant Banarasi Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black banarasi saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 69109,
    "category": "banarasi-sarees",
    "type": "Banarasi",
    "occasion": "Festive",
    "fabric": "Banarasi",
    "image_urls": [
      "/images/products/saree-10.jpg"
    ],
    "stock": 11
  },
  {
    "id": "prod-25",
    "title": "Crimson Red Modern Designer Saree",
    "description": "Discover the essence of Hubli's heritage with this crimson red designer saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 39399,
    "category": "designer-sarees",
    "type": "Designer",
    "occasion": "Party Wear",
    "fabric": "Designer",
    "image_urls": [
      "/images/products/saree-11.jpg"
    ],
    "stock": 5
  },
  {
    "id": "prod-26",
    "title": "Royal Blue Elegant Designer Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue designer saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 26057,
    "category": "designer-sarees",
    "type": "Designer",
    "occasion": "Party Wear",
    "fabric": "Designer",
    "image_urls": [
      "/images/products/saree-12.jpg"
    ],
    "stock": 4
  },
  {
    "id": "prod-27",
    "title": "Lavender Elegant Designer Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender designer saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 24121,
    "category": "designer-sarees",
    "type": "Designer",
    "occasion": "Party Wear",
    "fabric": "Designer",
    "image_urls": [
      "/images/products/saree-13.jpg"
    ],
    "stock": 2
  },
  {
    "id": "prod-28",
    "title": "Burgundy Vibrant Designer Saree",
    "description": "Discover the essence of Hubli's heritage with this burgundy designer saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 58413,
    "category": "designer-sarees",
    "type": "Designer",
    "occasion": "Party Wear",
    "fabric": "Designer",
    "image_urls": [
      "/images/products/saree-14.jpg"
    ],
    "stock": 20
  },
  {
    "id": "prod-29",
    "title": "Silver Modern Designer Saree",
    "description": "Discover the essence of Hubli's heritage with this silver designer saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 44393,
    "category": "designer-sarees",
    "type": "Designer",
    "occasion": "Party Wear",
    "fabric": "Designer",
    "image_urls": [
      "/images/products/saree-15.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-30",
    "title": "Royal Blue Traditional Designer Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue designer saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 32385,
    "category": "designer-sarees",
    "type": "Designer",
    "occasion": "Party Wear",
    "fabric": "Designer",
    "image_urls": [
      "/images/products/saree-1.jpg"
    ],
    "stock": 3
  },
  {
    "id": "prod-31",
    "title": "Ivory Exquisite Bridal Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory bridal saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any bridal occasion.",
    "price": 13236,
    "category": "bridal-sarees",
    "type": "Bridal",
    "occasion": "Bridal",
    "fabric": "Bridal",
    "image_urls": [
      "/images/products/saree-2.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-32",
    "title": "Silver Vibrant Bridal Saree",
    "description": "Discover the essence of Hubli's heritage with this silver bridal saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any bridal occasion.",
    "price": 65778,
    "category": "bridal-sarees",
    "type": "Bridal",
    "occasion": "Bridal",
    "fabric": "Bridal",
    "image_urls": [
      "/images/products/saree-3.jpg"
    ],
    "stock": 5
  },
  {
    "id": "prod-33",
    "title": "Lavender Exquisite Bridal Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender bridal saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any bridal occasion.",
    "price": 64421,
    "category": "bridal-sarees",
    "type": "Bridal",
    "occasion": "Bridal",
    "fabric": "Bridal",
    "image_urls": [
      "/images/products/saree-4.jpg"
    ],
    "stock": 8
  },
  {
    "id": "prod-34",
    "title": "Gold Modern Bridal Saree",
    "description": "Discover the essence of Hubli's heritage with this gold bridal saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any bridal occasion.",
    "price": 8337,
    "category": "bridal-sarees",
    "type": "Bridal",
    "occasion": "Bridal",
    "fabric": "Bridal",
    "image_urls": [
      "/images/products/saree-5.jpg"
    ],
    "stock": 6
  },
  {
    "id": "prod-35",
    "title": "Silver Exquisite Bridal Saree",
    "description": "Discover the essence of Hubli's heritage with this silver bridal saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any bridal occasion.",
    "price": 26136,
    "category": "bridal-sarees",
    "type": "Bridal",
    "occasion": "Bridal",
    "fabric": "Bridal",
    "image_urls": [
      "/images/products/saree-6.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-36",
    "title": "Ivory Elegant Bridal Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory bridal saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any bridal occasion.",
    "price": 13905,
    "category": "bridal-sarees",
    "type": "Bridal",
    "occasion": "Bridal",
    "fabric": "Bridal",
    "image_urls": [
      "/images/products/saree-7.jpg"
    ],
    "stock": 19
  },
  {
    "id": "prod-37",
    "title": "Emerald Green Exquisite Casual Saree",
    "description": "Discover the essence of Hubli's heritage with this emerald green casual saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 36253,
    "category": "casual-sarees",
    "type": "Casual",
    "occasion": "Casual",
    "fabric": "Casual",
    "image_urls": [
      "/images/products/saree-8.jpg"
    ],
    "stock": 19
  },
  {
    "id": "prod-38",
    "title": "Pastel Pink Traditional Casual Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink casual saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 45211,
    "category": "casual-sarees",
    "type": "Casual",
    "occasion": "Casual",
    "fabric": "Casual",
    "image_urls": [
      "/images/products/saree-9.jpg"
    ],
    "stock": 5
  },
  {
    "id": "prod-39",
    "title": "Teal Royal Casual Saree",
    "description": "Discover the essence of Hubli's heritage with this teal casual saree. Featuring an royal drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 36871,
    "category": "casual-sarees",
    "type": "Casual",
    "occasion": "Casual",
    "fabric": "Casual",
    "image_urls": [
      "/images/products/saree-10.jpg"
    ],
    "stock": 2
  },
  {
    "id": "prod-40",
    "title": "Pastel Pink Handwoven Casual Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink casual saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 15090,
    "category": "casual-sarees",
    "type": "Casual",
    "occasion": "Casual",
    "fabric": "Casual",
    "image_urls": [
      "/images/products/saree-11.jpg"
    ],
    "stock": 9
  },
  {
    "id": "prod-41",
    "title": "Lavender Modern Casual Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender casual saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 46339,
    "category": "casual-sarees",
    "type": "Casual",
    "occasion": "Casual",
    "fabric": "Casual",
    "image_urls": [
      "/images/products/saree-12.jpg"
    ],
    "stock": 18
  },
  {
    "id": "prod-42",
    "title": "Silver Vibrant Casual Saree",
    "description": "Discover the essence of Hubli's heritage with this silver casual saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any casual occasion.",
    "price": 7426,
    "category": "casual-sarees",
    "type": "Casual",
    "occasion": "Casual",
    "fabric": "Casual",
    "image_urls": [
      "/images/products/saree-13.jpg"
    ],
    "stock": 9
  },
  {
    "id": "prod-43",
    "title": "Ivory Handwoven Georgette Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory georgette saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 51539,
    "category": "georgette-sarees",
    "type": "Georgette",
    "occasion": "Festive",
    "fabric": "Georgette",
    "image_urls": [
      "/images/products/saree-14.jpg"
    ],
    "stock": 11
  },
  {
    "id": "prod-44",
    "title": "Ivory Modern Georgette Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory georgette saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 68719,
    "category": "georgette-sarees",
    "type": "Georgette",
    "occasion": "Festive",
    "fabric": "Georgette",
    "image_urls": [
      "/images/products/saree-15.jpg"
    ],
    "stock": 18
  },
  {
    "id": "prod-45",
    "title": "Lavender Royal Georgette Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender georgette saree. Featuring an royal drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 65596,
    "category": "georgette-sarees",
    "type": "Georgette",
    "occasion": "Festive",
    "fabric": "Georgette",
    "image_urls": [
      "/images/products/saree-1.jpg"
    ],
    "stock": 8
  },
  {
    "id": "prod-46",
    "title": "Midnight Black Traditional Georgette Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black georgette saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 66193,
    "category": "georgette-sarees",
    "type": "Georgette",
    "occasion": "Festive",
    "fabric": "Georgette",
    "image_urls": [
      "/images/products/saree-2.jpg"
    ],
    "stock": 8
  },
  {
    "id": "prod-47",
    "title": "Pastel Pink Exquisite Georgette Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink georgette saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 53877,
    "category": "georgette-sarees",
    "type": "Georgette",
    "occasion": "Festive",
    "fabric": "Georgette",
    "image_urls": [
      "/images/products/saree-3.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-48",
    "title": "Midnight Black Royal Georgette Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black georgette saree. Featuring an royal drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 64745,
    "category": "georgette-sarees",
    "type": "Georgette",
    "occasion": "Festive",
    "fabric": "Georgette",
    "image_urls": [
      "/images/products/saree-4.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-49",
    "title": "Midnight Black Luxurious Chiffon Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black chiffon saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 12844,
    "category": "chiffon-sarees",
    "type": "Chiffon",
    "occasion": "Party Wear",
    "fabric": "Chiffon",
    "image_urls": [
      "/images/products/saree-5.jpg"
    ],
    "stock": 3
  },
  {
    "id": "prod-50",
    "title": "Gold Traditional Chiffon Saree",
    "description": "Discover the essence of Hubli's heritage with this gold chiffon saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 70574,
    "category": "chiffon-sarees",
    "type": "Chiffon",
    "occasion": "Party Wear",
    "fabric": "Chiffon",
    "image_urls": [
      "/images/products/saree-6.jpg"
    ],
    "stock": 3
  },
  {
    "id": "prod-51",
    "title": "Teal Elegant Chiffon Saree",
    "description": "Discover the essence of Hubli's heritage with this teal chiffon saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 73113,
    "category": "chiffon-sarees",
    "type": "Chiffon",
    "occasion": "Party Wear",
    "fabric": "Chiffon",
    "image_urls": [
      "/images/products/saree-7.jpg"
    ],
    "stock": 6
  },
  {
    "id": "prod-52",
    "title": "Crimson Red Vibrant Chiffon Saree",
    "description": "Discover the essence of Hubli's heritage with this crimson red chiffon saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 19643,
    "category": "chiffon-sarees",
    "type": "Chiffon",
    "occasion": "Party Wear",
    "fabric": "Chiffon",
    "image_urls": [
      "/images/products/saree-8.jpg"
    ],
    "stock": 15
  },
  {
    "id": "prod-53",
    "title": "Burgundy Modern Chiffon Saree",
    "description": "Discover the essence of Hubli's heritage with this burgundy chiffon saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 22072,
    "category": "chiffon-sarees",
    "type": "Chiffon",
    "occasion": "Party Wear",
    "fabric": "Chiffon",
    "image_urls": [
      "/images/products/saree-9.jpg"
    ],
    "stock": 2
  },
  {
    "id": "prod-54",
    "title": "Silver Classic Chiffon Saree",
    "description": "Discover the essence of Hubli's heritage with this silver chiffon saree. Featuring an classic drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 25054,
    "category": "chiffon-sarees",
    "type": "Chiffon",
    "occasion": "Party Wear",
    "fabric": "Chiffon",
    "image_urls": [
      "/images/products/saree-10.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-55",
    "title": "Mustard Yellow Vibrant Net Saree",
    "description": "Discover the essence of Hubli's heritage with this mustard yellow net saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 7879,
    "category": "net-sarees",
    "type": "Net",
    "occasion": "Party Wear",
    "fabric": "Net",
    "image_urls": [
      "/images/products/saree-11.jpg"
    ],
    "stock": 13
  },
  {
    "id": "prod-56",
    "title": "Midnight Black Handwoven Net Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black net saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 21308,
    "category": "net-sarees",
    "type": "Net",
    "occasion": "Party Wear",
    "fabric": "Net",
    "image_urls": [
      "/images/products/saree-12.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-57",
    "title": "Midnight Black Exquisite Net Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black net saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 3096,
    "category": "net-sarees",
    "type": "Net",
    "occasion": "Party Wear",
    "fabric": "Net",
    "image_urls": [
      "/images/products/saree-13.jpg"
    ],
    "stock": 15
  },
  {
    "id": "prod-58",
    "title": "Mustard Yellow Traditional Net Saree",
    "description": "Discover the essence of Hubli's heritage with this mustard yellow net saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 11469,
    "category": "net-sarees",
    "type": "Net",
    "occasion": "Party Wear",
    "fabric": "Net",
    "image_urls": [
      "/images/products/saree-14.jpg"
    ],
    "stock": 11
  },
  {
    "id": "prod-59",
    "title": "Emerald Green Handwoven Net Saree",
    "description": "Discover the essence of Hubli's heritage with this emerald green net saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 45135,
    "category": "net-sarees",
    "type": "Net",
    "occasion": "Party Wear",
    "fabric": "Net",
    "image_urls": [
      "/images/products/saree-15.jpg"
    ],
    "stock": 9
  },
  {
    "id": "prod-60",
    "title": "Royal Blue Luxurious Net Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue net saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any party wear occasion.",
    "price": 8635,
    "category": "net-sarees",
    "type": "Net",
    "occasion": "Party Wear",
    "fabric": "Net",
    "image_urls": [
      "/images/products/saree-1.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-61",
    "title": "Lavender Exquisite Organza Saree",
    "description": "Discover the essence of Hubli's heritage with this lavender organza saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 58443,
    "category": "organza-sarees",
    "type": "Organza",
    "occasion": "Festive",
    "fabric": "Organza",
    "image_urls": [
      "/images/products/saree-2.jpg"
    ],
    "stock": 20
  },
  {
    "id": "prod-62",
    "title": "Royal Blue Royal Organza Saree",
    "description": "Discover the essence of Hubli's heritage with this royal blue organza saree. Featuring an royal drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 26941,
    "category": "organza-sarees",
    "type": "Organza",
    "occasion": "Festive",
    "fabric": "Organza",
    "image_urls": [
      "/images/products/saree-3.jpg"
    ],
    "stock": 17
  },
  {
    "id": "prod-63",
    "title": "Burgundy Elegant Organza Saree",
    "description": "Discover the essence of Hubli's heritage with this burgundy organza saree. Featuring an elegant drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 57896,
    "category": "organza-sarees",
    "type": "Organza",
    "occasion": "Festive",
    "fabric": "Organza",
    "image_urls": [
      "/images/products/saree-4.jpg"
    ],
    "stock": 8
  },
  {
    "id": "prod-64",
    "title": "Ivory Premium Organza Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory organza saree. Featuring an premium drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 59076,
    "category": "organza-sarees",
    "type": "Organza",
    "occasion": "Festive",
    "fabric": "Organza",
    "image_urls": [
      "/images/products/saree-5.jpg"
    ],
    "stock": 6
  },
  {
    "id": "prod-65",
    "title": "Pastel Pink Vibrant Organza Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink organza saree. Featuring an vibrant drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 39366,
    "category": "organza-sarees",
    "type": "Organza",
    "occasion": "Festive",
    "fabric": "Organza",
    "image_urls": [
      "/images/products/saree-6.jpg"
    ],
    "stock": 2
  },
  {
    "id": "prod-66",
    "title": "Pastel Pink Royal Organza Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink organza saree. Featuring an royal drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 58931,
    "category": "organza-sarees",
    "type": "Organza",
    "occasion": "Festive",
    "fabric": "Organza",
    "image_urls": [
      "/images/products/saree-7.jpg"
    ],
    "stock": 16
  },
  {
    "id": "prod-67",
    "title": "Ivory Royal Kanjivaram Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory kanjivaram saree. Featuring an royal drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 30654,
    "category": "kanjivaram-sarees",
    "type": "Kanjivaram",
    "occasion": "Festive",
    "fabric": "Kanjivaram",
    "image_urls": [
      "/images/products/saree-8.jpg"
    ],
    "stock": 13
  },
  {
    "id": "prod-68",
    "title": "Gold Premium Kanjivaram Saree",
    "description": "Discover the essence of Hubli's heritage with this gold kanjivaram saree. Featuring an premium drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 74913,
    "category": "kanjivaram-sarees",
    "type": "Kanjivaram",
    "occasion": "Festive",
    "fabric": "Kanjivaram",
    "image_urls": [
      "/images/products/saree-9.jpg"
    ],
    "stock": 18
  },
  {
    "id": "prod-69",
    "title": "Mustard Yellow Luxurious Kanjivaram Saree",
    "description": "Discover the essence of Hubli's heritage with this mustard yellow kanjivaram saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 33810,
    "category": "kanjivaram-sarees",
    "type": "Kanjivaram",
    "occasion": "Festive",
    "fabric": "Kanjivaram",
    "image_urls": [
      "/images/products/saree-10.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-70",
    "title": "Ivory Traditional Kanjivaram Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory kanjivaram saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 56104,
    "category": "kanjivaram-sarees",
    "type": "Kanjivaram",
    "occasion": "Festive",
    "fabric": "Kanjivaram",
    "image_urls": [
      "/images/products/saree-11.jpg"
    ],
    "stock": 7
  },
  {
    "id": "prod-71",
    "title": "Ivory Luxurious Kanjivaram Saree",
    "description": "Discover the essence of Hubli's heritage with this ivory kanjivaram saree. Featuring an luxurious drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 45533,
    "category": "kanjivaram-sarees",
    "type": "Kanjivaram",
    "occasion": "Festive",
    "fabric": "Kanjivaram",
    "image_urls": [
      "/images/products/saree-12.jpg"
    ],
    "stock": 10
  },
  {
    "id": "prod-72",
    "title": "Gold Modern Kanjivaram Saree",
    "description": "Discover the essence of Hubli's heritage with this gold kanjivaram saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 36511,
    "category": "kanjivaram-sarees",
    "type": "Kanjivaram",
    "occasion": "Festive",
    "fabric": "Kanjivaram",
    "image_urls": [
      "/images/products/saree-13.jpg"
    ],
    "stock": 6
  },
  {
    "id": "prod-73",
    "title": "Gold Modern Chanderi Saree",
    "description": "Discover the essence of Hubli's heritage with this gold chanderi saree. Featuring an modern drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 49296,
    "category": "chanderi-sarees",
    "type": "Chanderi",
    "occasion": "Festive",
    "fabric": "Chanderi",
    "image_urls": [
      "/images/products/saree-14.jpg"
    ],
    "stock": 15
  },
  {
    "id": "prod-74",
    "title": "Pastel Pink Traditional Chanderi Saree",
    "description": "Discover the essence of Hubli's heritage with this pastel pink chanderi saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 52649,
    "category": "chanderi-sarees",
    "type": "Chanderi",
    "occasion": "Festive",
    "fabric": "Chanderi",
    "image_urls": [
      "/images/products/saree-15.jpg"
    ],
    "stock": 2
  },
  {
    "id": "prod-75",
    "title": "Mustard Yellow Traditional Chanderi Saree",
    "description": "Discover the essence of Hubli's heritage with this mustard yellow chanderi saree. Featuring an traditional drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 2034,
    "category": "chanderi-sarees",
    "type": "Chanderi",
    "occasion": "Festive",
    "fabric": "Chanderi",
    "image_urls": [
      "/images/products/saree-1.jpg"
    ],
    "stock": 7
  },
  {
    "id": "prod-76",
    "title": "Midnight Black Handwoven Chanderi Saree",
    "description": "Discover the essence of Hubli's heritage with this midnight black chanderi saree. Featuring an handwoven drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 22879,
    "category": "chanderi-sarees",
    "type": "Chanderi",
    "occasion": "Festive",
    "fabric": "Chanderi",
    "image_urls": [
      "/images/products/saree-2.jpg"
    ],
    "stock": 8
  },
  {
    "id": "prod-77",
    "title": "Crimson Red Premium Chanderi Saree",
    "description": "Discover the essence of Hubli's heritage with this crimson red chanderi saree. Featuring an premium drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 51607,
    "category": "chanderi-sarees",
    "type": "Chanderi",
    "occasion": "Festive",
    "fabric": "Chanderi",
    "image_urls": [
      "/images/products/saree-3.jpg"
    ],
    "stock": 5
  },
  {
    "id": "prod-78",
    "title": "Emerald Green Exquisite Chanderi Saree",
    "description": "Discover the essence of Hubli's heritage with this emerald green chanderi saree. Featuring an exquisite drape and meticulous craftsmanship from Prerna Sarees, perfect for any festive occasion.",
    "price": 2557,
    "category": "chanderi-sarees",
    "type": "Chanderi",
    "occasion": "Festive",
    "fabric": "Chanderi",
    "image_urls": [
      "/images/products/saree-4.jpg"
    ],
    "stock": 9
  }
];
