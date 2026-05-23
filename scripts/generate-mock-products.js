const fs = require('fs');

const categories = [
  "silk", "cotton", "linen", "banarasi", "designer", "bridal", "casual", 
  "georgette", "chiffon", "net", "organza", "kanjivaram", "chanderi"
];

const adjectives = ["Premium", "Exquisite", "Royal", "Elegant", "Traditional", "Modern", "Handwoven", "Classic", "Luxurious", "Vibrant"];
const colors = ["Burgundy", "Crimson Red", "Emerald Green", "Royal Blue", "Mustard Yellow", "Ivory", "Midnight Black", "Pastel Pink", "Teal", "Lavender", "Gold", "Silver"];

const products = [];
let idCounter = 1;

categories.forEach(category => {
  for (let i = 0; i < 6; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const price = Math.floor(Math.random() * 74000) + 1000; // 1000 to 75000
    
    // Formatting for display
    const typeDisplay = category.charAt(0).toUpperCase() + category.slice(1);
    
    let occasion = "Festive";
    if (category === "bridal") occasion = "Bridal";
    else if (category === "casual" || category === "cotton" || category === "linen") occasion = "Casual";
    else if (category === "designer" || category === "net" || category === "chiffon") occasion = "Party Wear";

    const title = `${color} ${adj} ${typeDisplay} Saree`;
    const description = `Discover the essence of Hubli's heritage with this ${color.toLowerCase()} ${typeDisplay.toLowerCase()} saree. Featuring an ${adj.toLowerCase()} drape and meticulous craftsmanship from Prerna Sarees, perfect for any ${occasion.toLowerCase()} occasion.`;
    
    products.push({
      id: `prod-${idCounter}`,
      title,
      description,
      price,
      category: `${category}-sarees`,
      type: typeDisplay,
      occasion,
      fabric: typeDisplay,
      image_urls: [`/images/products/saree-${(idCounter % 15) + 1}.jpg`],
      stock: Math.floor(Math.random() * 20) + 1,
    });
    
    idCounter++;
  }
});

const fileContent = `export type Product = {
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
};

export const MOCK_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync('./src/lib/data/mock-products.ts', fileContent);
console.log('Successfully generated mock-products.ts with ' + products.length + ' products.');
