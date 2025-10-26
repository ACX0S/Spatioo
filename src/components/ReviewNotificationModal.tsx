import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { createReview } from '@/services/reviewService';
import { toast } from '@/hooks/use-toast';
import { TAGS_ESTACIONAMENTO, TAGS_MOTORISTA } from '@/types/review';
import { Badge } from '@/components/ui/badge';

interface ReviewNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  avaliadoTipo: 'motorista' | 'estacionamento';
  avaliadoId: string;
  targetName: string;
}

export const ReviewNotificationModal = ({
  isOpen,
  onClose,
  bookingId,
  avaliadoTipo,
  avaliadoId,
  targetName
}: ReviewNotificationModalProps) => {
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = avaliadoTipo === 'estacionamento' ? TAGS_ESTACIONAMENTO : TAGS_MOTORISTA;

  const handleSubmit = async () => {
    if (nota === 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma nota.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview({
        booking_id: bookingId,
        avaliado_tipo: avaliadoTipo,
        avaliado_id: avaliadoId,
        nota,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        comentario: comentario.trim() || undefined,
      });

      toast({
        title: 'Avaliação enviada!',
        description: 'Obrigado pelo seu feedback.',
      });

      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar a avaliação.',
        variant: 'destructive',
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
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-primary to-spatioo-green bg-clip-text text-transparent">
            Avalie sua experiência
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Como foi sua experiência com {targetName}?
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seletor de estrelas */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setNota(star)}
                onMouseEnter={() => setHoverNota(star)}
                onMouseLeave={() => setHoverNota(0)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none"
              >
                <Star
                  className={`h-10 w-10 transition-all ${
                    star <= (hoverNota || nota)
                      ? 'fill-spatioo-green text-spatioo-green'
                      : 'text-muted-foreground'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Mostrar nota selecionada */}
          {nota > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-muted-foreground"
            >
              Você deu <strong className="text-spatioo-green">{nota}</strong> {nota === 1 ? 'estrela' : 'estrelas'}
            </motion.p>
          )}

          {/* Tags (só aparece se nota < 5) */}
          {nota > 0 && nota < 5 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <p className="text-sm font-medium">O que poderia melhorar?</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Comentário */}
          <div className="space-y-2">
            <label htmlFor="comentario" className="text-sm font-medium">
              Descreva sua experiência (opcional)
            </label>
            <Textarea
              id="comentario"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Botão de confirmar */}
          <Button
            onClick={handleSubmit}
            disabled={nota === 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-spatioo-green hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Avaliação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
