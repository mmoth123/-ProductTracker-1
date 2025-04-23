import { useLanguage } from "@/context/language-context";
import { getTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Sample data for the chart
const generateChartData = (months = 6) => {
  const currentDate = new Date();
  const data = [];
  
  for (let i = 0; i < months; i++) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    data.unshift({
      name: monthName,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      profit: Math.floor(Math.random() * 2000) + 500,
      products: Math.floor(Math.random() * 20) + 5,
    });
  }
  
  return data;
};

interface SalesChartProps {
  data?: any[];
  title?: string;
}

export function SalesChart({ 
  data = generateChartData(), 
  title 
}: SalesChartProps) {
  const { currentLanguage } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>
          {title || getTranslation("monthlyStats", currentLanguage)}
        </CardTitle>
        <Select defaultValue="30">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00acc1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00acc1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3f51b5" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue" 
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#00acc1" 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              name="Profit" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
