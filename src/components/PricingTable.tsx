import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, DollarSign, Clock } from "lucide-react";

export interface PricingRow {
  id: string;
  horas: string;
  preco: string;
}

interface PricingTableProps {
  pricing: PricingRow[];
  onChange: (pricing: PricingRow[]) => void;
  error?: string;
}

const PricingTable = ({ pricing, onChange, error }: PricingTableProps) => {
  const addRow = () => {
    const newRow: PricingRow = {
      id: crypto.randomUUID(),
      horas: "",
      preco: ""
    };
    onChange([...pricing, newRow]);
  };

  const removeRow = (id: string) => {
    if (pricing.length > 1) {
      onChange(pricing.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: 'horas' | 'preco', value: string) => {
    const updatedPricing = pricing.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    );
    
    // Sort by hours (ascending) after update
    const sortedPricing = [...updatedPricing].sort((a, b) => {
      const horasA = parseFloat(a.horas) || 0;
      const horasB = parseFloat(b.horas) || 0;
      return horasA - horasB;
    });
    
    onChange(sortedPricing);
  };

  // Initialize with one row if empty
  useEffect(() => {
    if (pricing.length === 0) {
      addRow();
    }
  }, []);

  const validateRow = (row: PricingRow) => {
    const horas = parseFloat(row.horas);
    const preco = parseFloat(row.preco);
    
    return {
      hasHoras: row.horas.trim() !== "",
      hasPreco: row.preco.trim() !== "",
      validHoras: horas > 0,
      validPreco: preco > 0
    };
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 dark:text-spatioo-green" />
        Tabela de Preços por Hora
      </Label>
      
      <div className="border rounded-lg p-4 space-y-3">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 items-center text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 dark:text-spatioo-green" />
            Horas
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 dark:text-spatioo-green" />
            Preço (R$)
          </div>
          <div className="text-center">Ações</div>
        </div>
        
        {/* Pricing Rows */}
        <div className="space-y-2">
          {pricing.map((row) => {
            const validation = validateRow(row);
            
            return (
              <div key={row.id} className="grid grid-cols-3 gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="1"
                  value={row.horas}
                  onChange={(e) => updateRow(row.id, 'horas', e.target.value)}
                  className={`
                    ${!validation.hasHoras && row.horas !== "" ? "border-destructive" : ""}
                    ${validation.hasHoras && !validation.validHoras ? "border-destructive" : ""}
                  `}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="15.00"
                  value={row.preco}
                  onChange={(e) => updateRow(row.id, 'preco', e.target.value)}
                  className={`
                    ${!validation.hasPreco && row.preco !== "" ? "border-destructive" : ""}
                    ${validation.hasPreco && !validation.validPreco ? "border-destructive" : ""}
                  `}
                />
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    disabled={pricing.length === 1}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Add Row Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Linha
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <p className="text-xs text-muted-foreground">
        * As linhas são automaticamente ordenadas por quantidade de horas
      </p>
    </div>
  );
};

export default PricingTable;