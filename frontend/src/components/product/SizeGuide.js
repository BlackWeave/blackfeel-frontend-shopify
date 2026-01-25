import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SIZE_GUIDE, SIZES } from '@/data/products';
import { Ruler } from 'lucide-react';

export const SizeGuide = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            Size Guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wider">
            SIZE GUIDE
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Measurement Instructions */}
          <p className="text-sm text-muted-foreground">
            All measurements are in inches. For the best fit, measure a similar t-shirt 
            you already own and compare to the chart below.
          </p>

          {/* Size Table */}
          <div className="border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-display tracking-wider">SIZE</TableHead>
                  <TableHead className="font-display tracking-wider">CHEST</TableHead>
                  <TableHead className="font-display tracking-wider">LENGTH</TableHead>
                  <TableHead className="font-display tracking-wider">SHOULDER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SIZES.map((size) => (
                  <TableRow key={size}>
                    <TableCell className="font-medium">{size}</TableCell>
                    <TableCell>{SIZE_GUIDE[size].chest}"</TableCell>
                    <TableCell>{SIZE_GUIDE[size].length}"</TableCell>
                    <TableCell>{SIZE_GUIDE[size].shoulder}"</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Fit Tips */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">How to Measure</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">Chest:</span>
                Measure across the fullest part of the chest, under the arms.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">Length:</span>
                Measure from the highest point of the shoulder to the bottom hem.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">Shoulder:</span>
                Measure from shoulder seam to shoulder seam across the back.
              </li>
            </ul>
          </div>

          {/* Contact */}
          <p className="text-sm text-muted-foreground border-t border-border pt-4">
            Still unsure? Contact us at{' '}
            <a href="mailto:fit@swantee.com" className="underline hover:text-foreground">
              fit@swantee.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
