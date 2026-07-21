import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

interface TotalPriceProps {
  total: number;
  label?: string;
}

export default function TotalPrice({ total, label = "Total Acumulado" }: TotalPriceProps) {
  return (
    <motion.div 
      className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-green-600">{label}</p>
          <p className="text-lg font-bold text-green-700">
            ${total.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
} 