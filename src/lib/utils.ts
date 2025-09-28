
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * @function calculateParkingPrice
 * @description Calcula o preço do estacionamento baseado na lógica de cobrança:
 * - Até 1 hora: cobra valor mínimo de 1 hora
 * - Acima de 1 hora: cobra valor da próxima hora cadastrada
 * - Caso não exista valor cadastrado: aplica valor da hora extra
 * 
 * @param durationMinutes - Duração em minutos
 * @param pricingTable - Tabela de preços com horas e valores
 * @param horaExtra - Valor da hora extra quando não há preço específico
 * @returns Preço calculado em R$
 */
export function calculateParkingPrice(
  durationMinutes: number, 
  pricingTable: Array<{horas: number, preco: number}>, 
  horaExtra: number
): number {
  // Converte minutos para horas (arredondando para cima)
  const horasNecessarias = Math.ceil(durationMinutes / 60);
  
  // Ordena a tabela de preços por horas crescente
  const sortedPricing = pricingTable.sort((a, b) => a.horas - b.horas);
  
  // Até 1 hora: cobra valor de 1 hora
  if (horasNecessarias <= 1) {
    const oneHourPrice = sortedPricing.find(p => p.horas === 1);
    return oneHourPrice ? oneHourPrice.preco : horaExtra;
  }
  
  // Procura o próximo valor cadastrado que cubra o período
  for (let i = 0; i < sortedPricing.length; i++) {
    if (sortedPricing[i].horas >= horasNecessarias) {
      return sortedPricing[i].preco;
    }
  }
  
  // Se não encontrou valor específico, aplica lógica da hora extra
  // Pega o maior valor cadastrado e adiciona horas extras
  const maiorValorCadastrado = sortedPricing[sortedPricing.length - 1];
  const horasExtras = horasNecessarias - maiorValorCadastrado.horas;
  
  return maiorValorCadastrado.preco + (horasExtras * horaExtra);
}

/**
 * @function formatCnpj  
 * @description Formata CNPJ no padrão brasileiro (99.999.999/9999-99)
 * @param cnpj - String com números do CNPJ
 * @returns CNPJ formatado
 */
export function formatCnpj(cnpj: string): string {
  // Remove tudo que não é dígito e limita a 14 caracteres
  const numbersOnly = cnpj.replace(/\D/g, '').slice(0, 14);
  
  // Aplica a formatação progressivamente
  if (numbersOnly.length <= 2) return numbersOnly;
  if (numbersOnly.length <= 5) return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`;
  if (numbersOnly.length <= 8) return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5)}`;
  if (numbersOnly.length <= 12) return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}/${numbersOnly.slice(8)}`;
  return `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2, 5)}.${numbersOnly.slice(5, 8)}/${numbersOnly.slice(8, 12)}-${numbersOnly.slice(12)}`;
}
