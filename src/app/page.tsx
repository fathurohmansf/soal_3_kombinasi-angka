"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Calculator, ClipboardCopy, Trash2, TestTube2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Combination = {
  letters: string;
  numbers: string;
};

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [digits, setDigits] = useState("1243752521494312");
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executionTime, setExecutionTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const handleCalculate = useCallback((inputDigits: string) => {
    if (!/^\d+$/.test(inputDigits) && inputDigits) {
      toast({
        variant: "destructive",
        title: "Input Tidak Valid",
        description: "Harap masukkan digit yang valid (hanya angka).",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setCombinations([]);
    setCurrentPage(1);
    
    // Use a short timeout to allow the UI to update to the loading state before the heavy computation begins.
    setTimeout(() => {
      const startTime = performance.now();
      const results: Combination[] = [];
      
      if (inputDigits) {
        function findCombinations(s: string) {
            function backtrack(index: number, currentPath: string[], currentLetters: string[]) {
              if (results.length >= 50000) return; // Safety break for extremely long inputs
              if (index === s.length) {
                results.push({ letters: currentLetters.join(''), numbers: currentPath.join(' ') });
                return;
              }
        
              // 1-digit number
              const num1 = parseInt(s.substring(index, index + 1));
              if (num1 >= 1) { // 1-9
                currentPath.push(String(num1));
                currentLetters.push(String.fromCharCode(64 + num1));
                backtrack(index + 1, currentPath, currentLetters);
                currentPath.pop();
                currentLetters.pop();
              }
        
              // 2-digit number
              if (index + 1 < s.length) {
                const num2 = parseInt(s.substring(index, index + 2));
                if (num2 >= 10 && num2 <= 26) {
                  currentPath.push(String(num2));
                  currentLetters.push(String.fromCharCode(64 + num2));
                  backtrack(index + 2, currentPath, currentLetters);
                  currentPath.pop();
                  currentLetters.pop();
                }
              }
            }
            backtrack(0, [], []);
        }
        findCombinations(inputDigits);
      }
      
      const endTime = performance.now();
      setCombinations(results);
      setExecutionTime(endTime - startTime);
      setIsLoading(false);
      if (results.length >= 50000) {
        toast({
          variant: "destructive",
          title: "Batas Tercapai",
          description: "Perhitungan dihentikan setelah 50,000 kombinasi untuk menjaga performa.",
        });
      }
    }, 50);
  }, [toast]);

  useEffect(() => {
    handleCalculate(digits);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paginatedCombinations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return combinations.slice(startIndex, endIndex);
  }, [combinations, currentPage]);

  const totalPages = Math.ceil(combinations.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleClear = () => {
    setDigits("");
    setCombinations([]);
    setExecutionTime(0);
    setCurrentPage(1);
    setIsLoading(false);
  };
  
  const testExample = () => {
    const example = "1232345";
    setDigits(example);
    handleCalculate(example);
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCalculate(digits);
  }

  return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">
                Kalkulator Kombinasi Persamaan angka
              </h1>
              <p className="text-lg text-muted-foreground">
                Ubah urutan digit menjadi semua kemungkinan kombinasi huruf.
              </p>
            </header>

            <Card className="mb-6 shadow-lg">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-primary" />
                      Kalkulator Kombinasi
                  </CardTitle>
                  <CardDescription>Masukkan digit untuk menghasilkan kombinasi huruf (A=1, ..., Z=26).</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onFormSubmit} className="flex flex-col sm:flex-row gap-4">
                  <Input
                    id="digitInput"
                    type="text"
                    pattern="\d*"
                    placeholder="Masukkan digit..."
                    value={digits}
                    onChange={(e) => setDigits(e.target.value)}
                    className="text-lg flex-grow font-code tracking-wider"
                    aria-label="Digit Input"
                  />
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Calculator className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Menghitung...' : 'Hitung'}
                  </Button>
                </form>
                  <div>
                   <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4"/>
                      Clear
                   </Button>
                   </div>
              </CardContent>
            </Card>

            {(combinations.length > 0 || isLoading) && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Hasil</CardTitle>
                  {!isLoading && (
                    <CardDescription>
                      Ditemukan <strong>{combinations.length.toLocaleString()}</strong> kombinasi dalam <strong>{executionTime.toFixed(2)}ms</strong>.
                       {totalPages > 1 && ` Halaman ${currentPage} dari ${totalPages.toLocaleString()}.`}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                         <div key={i} className="border p-4 rounded-lg bg-card space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedCombinations.map((combo, index) => (
                          <div key={index} className="border p-4 rounded-lg bg-secondary/30 relative group transition-all hover:shadow-md hover:border-primary/50">
                             <Button 
                                size="icon" 
                                variant="ghost" 
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  navigator.clipboard.writeText(combo.letters);
                                  toast({ title: "Disalin!", description: `"${combo.letters}" disalin ke clipboard.` });
                                }}
                                aria-label="Salin kombinasi huruf"
                             >
                               <ClipboardCopy className="h-4 w-4" />
                             </Button>
                            <p className="font-headline font-bold text-lg text-primary truncate pr-8" title={combo.letters}>{combo.letters}</p>
                            <p className="text-sm text-muted-foreground font-code">{combo.numbers}</p>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Sebelumnya
                          </Button>
                          <span className="text-sm text-muted-foreground font-medium">
                           {currentPage} / {totalPages.toLocaleString()}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Selanjutnya
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm">
        © 2025 Ahmad Fathurohman.
        </footer>
      </div>
  );
}
