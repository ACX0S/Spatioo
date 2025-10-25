import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TAGS_ESTACIONAMENTO, TAGS_MOTORISTA } from '@/types/review';
import { createReview } from '@/services/reviewService';
import { toast } from '@/hooks/use-toast';
import { Booking } from '@/types/booking';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking;
  avaliadoTipo: 'motorista' | 'estacionamento';
  avaliadoId: string;
}

export const ReviewModal = ({ open, onClose, booking, avaliadoTipo, avaliadoId }: ReviewModalProps) => {
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = avaliadoTipo === 'estacionamento' ? TAGS_ESTACIONAMENTO : TAGS_MOTORISTA;

  const handleSubmit = async () => {
    if (nota === 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma nota',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        booking_id: booking.id,
        avaliado_tipo: avaliadoTipo,
        avaliado_id: avaliadoId,
        nota,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        comentario: comentario.trim() || undefined
      });

      toast({
        title: 'Sucesso',
        description: 'Avaliação enviada com sucesso!'
      });

      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar sua avaliação',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNota(0);
    setHoverNota(0);
    setSelectedTags([]);
    setComentario('');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Avalie sua experiência
          </DialogTitle>
          <DialogDescription className="text-center">
            Sua opinião nos ajuda a melhorar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seletor de Estrelas */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNota(star)}
                onMouseEnter={() => setHoverNota(star)}
                onMouseLeave={() => setHoverNota(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoverNota || nota)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Tags (apenas se nota < 5) */}
          {nota > 0 && nota < 5 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <p className="text-sm font-medium">O que poderia melhorar?</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Comentário */}
          {nota > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="text-sm font-medium">
                Descreva sua experiência (opcional)
              </label>
              <Textarea
                placeholder="Compartilhe mais detalhes sobre sua experiência..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {comentario.length}/500
              </p>
            </motion.div>
          )}

          {/* Botão de Confirmar */}
          <Button
            onClick={handleSubmit}
            disabled={nota === 0 || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Avaliação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
