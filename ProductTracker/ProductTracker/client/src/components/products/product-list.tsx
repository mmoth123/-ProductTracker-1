import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/language-context";
import { getTranslation } from "@/lib/i18n";
import { Product } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductFilterProps {
  status: string;
  setStatus: (status: string) => void;
  game: string;
  setGame: (game: string) => void;
  date: string;
  setDate: (date: string) => void;
}

function ProductFilters({
  status,
  setStatus,
  game,
  setGame,
  date,
  setDate,
}: ProductFilterProps) {
  const { currentLanguage } = useLanguage();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 mb-5 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {getTranslation("status", currentLanguage)}
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="available">Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="game"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {getTranslation("gameName", currentLanguage)}
          </label>
          <Select value={game} onValueChange={setGame}>
            <SelectTrigger id="game" className="w-full">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="League of Legends">League of Legends</SelectItem>
              <SelectItem value="Valorant">Valorant</SelectItem>
              <SelectItem value="Fortnite">Fortnite</SelectItem>
              <SelectItem value="Call of Duty">Call of Duty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {getTranslation("date", currentLanguage)}
          </label>
          <Select value={date} onValueChange={setDate}>
            <SelectTrigger id="date" className="w-full">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function ProductList() {
  const { currentLanguage } = useLanguage();
  const [status, setStatus] = useState("all");
  const [game, setGame] = useState("all");
  const [date, setDate] = useState("all");

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products based on selected filters
  const filteredProducts = products?.filter((product) => {
    let matches = true;

    if (status !== "all") {
      matches = matches && product.status === status;
    }

    if (game !== "all") {
      matches = matches && product.gameName === game;
    }

    if (date !== "all") {
      const productDate = new Date(product.dateReceived);
      const today = new Date();
      const dayStart = new Date(today);
      dayStart.setHours(0, 0, 0, 0);

      if (date === "today") {
        matches = matches && productDate >= dayStart;
      } else if (date === "week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        matches = matches && productDate >= weekStart;
      } else if (date === "month") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        matches = matches && productDate >= monthStart;
      } else if (date === "last_month") {
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        matches = matches && productDate >= lastMonthStart && productDate < thisMonthStart;
      }
    }

    return matches;
  });

  const renderStatusBadge = (status: string) => {
    if (status === "sold") {
      return (
        <Badge variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
          {getTranslation("soldProducts", currentLanguage)}
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">
        {getTranslation("availableProducts", currentLanguage)}
      </Badge>
    );
  };

  return (
    <div>
      <ProductFilters
        status={status}
        setStatus={setStatus}
        game={game}
        setGame={setGame}
        date={date}
        setDate={setDate}
      />

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{getTranslation("productDetails", currentLanguage)}</TableHead>
                <TableHead>{getTranslation("gameName", currentLanguage)}</TableHead>
                <TableHead>{getTranslation("dateReceived", currentLanguage)}</TableHead>
                <TableHead>{getTranslation("costPrice", currentLanguage)}</TableHead>
                <TableHead>{getTranslation("sellingPrice", currentLanguage)}</TableHead>
                <TableHead>{getTranslation("profit", currentLanguage)}</TableHead>
                <TableHead>{getTranslation("status", currentLanguage)}</TableHead>
                <TableHead className="text-right">{getTranslation("actions", currentLanguage)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {getTranslation("noDataAvailable", currentLanguage)}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          {product.gameName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: #{product.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.gameName}</TableCell>
                    <TableCell>
                      {product.dateReceived 
                        ? format(new Date(product.dateReceived), "yyyy-MM-dd") 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {product.costPrice != null 
                        ? `$${product.costPrice.toFixed(2)}` 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {product.sellingPrice != null 
                        ? `$${product.sellingPrice.toFixed(2)}` 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 dark:text-green-400">
                        {product.profit != null 
                          ? `$${product.profit.toFixed(2)}` 
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{renderStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="ghost" size="icon" className="text-primary">
                          <Eye className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href={`/products/${product.id}?edit=true`}>
                        <Button variant="ghost" size="icon" className="text-blue-600 dark:text-blue-400">
                          <Edit className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!isLoading && filteredProducts && filteredProducts.length > 0 && (
          <CardContent className="py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of <span className="font-medium">{products?.length}</span> results
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
