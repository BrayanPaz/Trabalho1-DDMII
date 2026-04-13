export interface Donghua {
  id: string;
  title: string;
  status: 'Assistindo' | 'Pausado' | 'Finalizado';
  currentEp: number;
  nextEpDate: string; // Formato YYYY-MM-DD
  createdAt: number;
}