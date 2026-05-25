import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateInvoice = (order: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Colors
  const burgundy: [number, number, number] = [107, 29, 29];
  const gold: [number, number, number] = [201, 168, 76];
  const lightIvory: [number, number, number] = [253, 248, 240];
  
  // Header background
  doc.setFillColor(...burgundy);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PRERNA SILKS', 15, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Weaving Elegance Since Generations', 15, 27);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Javali Sal, Hubli, Karnataka - 580020', 15, 34);
  doc.text('+91 8660087544 | prernasilks@gmail.com', 15, 40);
  
  // INVOICE text on right
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 168, 76); // gold
  doc.text('INVOICE', pageWidth - 15, 25, { align: 'right' });
  
  // Invoice details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  const invoiceNum = '#INV-' + order.id.slice(-8).toUpperCase();
  doc.text(invoiceNum, pageWidth - 15, 33, { align: 'right' });
  doc.text('Date: ' + formatDate(order.created_at), pageWidth - 15, 39, { align: 'right' });
  
  // Gold divider
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.line(15, 50, pageWidth - 15, 50);
  
  // Bill To section
  doc.setTextColor(107, 29, 29);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 15, 60);
  
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(order.customer_name || '', 15, 68);
  doc.text(order.customer_phone || '', 15, 74);
  
  const address = order.delivery_address;
  if (address) {
    doc.text(address.street || address.address1 || '', 15, 80);
    doc.text(
      (address.city || '') + ', ' + 
      (address.state || '') + 
      ' - ' + (address.pincode || ''), 
      15, 86
    );
  }
  
  // Payment info on right
  doc.setTextColor(107, 29, 29);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PAYMENT INFO:', pageWidth - 80, 60);
  
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Method: ' + (
    order.payment_method === 'upi' 
      ? 'UPI Payment' 
      : 'Cash on Delivery'
  ), pageWidth - 80, 68);
  
  doc.text('Status: ' + (
    order.payment_status === 'paid' 
      ? 'PAID' 
      : (order.payment_status || 'Pending')
  ), pageWidth - 80, 74);
  
  if (order.utr_number) {
    doc.text('UTR: ' + order.utr_number, pageWidth - 80, 80);
  }
  
  // Products table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableData = (order.order_items || order.items || []).map((item: any, index: number) => [
      index + 1,
      item.product?.title || item.product?.name || item.product_name || item.product_title || 'Item',
      item.product?.categories?.name || item.product?.categories?.slug || item.product?.category || '',
      item.quantity,
      'Rs.' + Number(item.price_at_time || item.price || 0).toLocaleString('en-IN'),
      'Rs.' + (Number(item.price_at_time || item.price || 0) * item.quantity).toLocaleString('en-IN')
    ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['#', 'Product', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    headStyles: {
      fillColor: burgundy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: lightIvory
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Summary section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subtotal = (order.order_items || order.items || []).reduce(
    (sum: number, item: { price_at_time?: number, price?: number, quantity: number }) => 
      sum + (Number(item.price_at_time || item.price || 0) * item.quantity), 
    0
  ) || 0;
  
  const shipping = subtotal >= 2000 ? 0 : 99;
  const total = subtotal + shipping;
  
  // Summary box
  doc.setFillColor(...lightIvory);
  doc.rect(pageWidth - 90, finalY - 5, 75, 45, 'F');
  doc.setDrawColor(...gold);
  doc.rect(pageWidth - 90, finalY - 5, 75, 45, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  
  doc.text('Subtotal:', pageWidth - 85, finalY + 5);
  doc.text(
    'Rs.' + subtotal.toLocaleString('en-IN'),
    pageWidth - 20, finalY + 5, 
    { align: 'right' }
  );
  
  doc.text('Shipping:', pageWidth - 85, finalY + 12);
  doc.text(
    shipping === 0 ? 'FREE' : 'Rs.99',
    pageWidth - 20, finalY + 12, 
    { align: 'right' }
  );
  
  // Total line
  doc.setDrawColor(...gold);
  doc.line(
    pageWidth - 85, finalY + 16, 
    pageWidth - 20, finalY + 16
  );
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...burgundy);
  doc.text('TOTAL:', pageWidth - 85, finalY + 24);
  doc.text(
    'Rs.' + total.toLocaleString('en-IN'),
    pageWidth - 20, finalY + 24, 
    { align: 'right' }
  );
  
  // Footer
  const footerY = doc.internal.pageSize.height - 25;
  
  doc.setDrawColor(...gold);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Thank you for shopping with Prerna Silks!', 
    15, footerY
  );
  doc.text(
    'WhatsApp: +91 8660087544', 
    15, footerY + 6
  );
  
  doc.text(
    'This is a computer generated invoice. No signature required.',
    pageWidth / 2, footerY,
    { align: 'center' }
  );
  
  doc.text(
    'prernasilks.vercel.app',
    pageWidth - 15, footerY,
    { align: 'right' }
  );
  
  // Burgundy bottom bar
  doc.setFillColor(...burgundy);
  doc.rect(
    0, 
    doc.internal.pageSize.height - 8, 
    pageWidth, 
    8, 
    'F'
  );
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(
    'Prerna Silks | Javali Sal, Hubli, Karnataka | prernasilks@gmail.com',
    pageWidth / 2,
    doc.internal.pageSize.height - 3,
    { align: 'center' }
  );
  
  // Save the PDF
  const fileName = 'PrernaSilks_Invoice_' + invoiceNum + '.pdf';
  doc.save(fileName);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric'
  });
};
