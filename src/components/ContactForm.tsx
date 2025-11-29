'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Phone, FileText, ShoppingBag, X, Upload, Send } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ContactFormProps {
  onSubmit: (formData: any) => void;
}

const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    orderNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = [
    t('contact_form.subjects.general'),
    t('contact_form.subjects.order_issue'),
    t('contact_form.subjects.return'),
    t('contact_form.subjects.suggestion'),
    t('contact_form.subjects.partnership'),
    t('contact_form.subjects.other')
  ];

  // Sauvegarder dans localStorage
  useEffect(() => {
    const saved = localStorage.getItem('contactFormDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Erreur lors de la récupération du brouillon:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Sauvegarder automatiquement toutes les 2 secondes
    const timer = setTimeout(() => {
      localStorage.setItem('contactFormDraft', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        orderNumber: formData.orderNumber
      }));
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact_form.errors.name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('contact_form.errors.name_min');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact_form.errors.email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact_form.errors.email_invalid');
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t('contact_form.errors.phone_invalid');
    }

    if (!formData.subject) {
      newErrors.subject = t('contact_form.errors.subject_required');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact_form.errors.message_required');
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t('contact_form.errors.message_min');
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = t('contact_form.errors.message_max', { count: MAX_MESSAGE_LENGTH });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, attachments });
      // Reset form
      setFormData({ name: '', email: '', phone: '', subject: '', message: '', orderNumber: '' });
      setErrors({});
      setAttachments([]);
      setAttachmentErrors([]);
      localStorage.removeItem('contactFormDraft');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file, index) => {
      if (attachments.length + validFiles.length >= MAX_FILES) {
        newErrors.push(t('contact_form.max_files', { count: MAX_FILES }));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name}: ${t('contact_form.max_size')}`);
        return;
      }

      validFiles.push(file);
    });

    setAttachmentErrors(newErrors);
    setAttachments(prev => [...prev, ...validFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const messageLength = formData.message.length;
  const messageProgress = (messageLength / MAX_MESSAGE_LENGTH) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-[#424242] mb-4 sm:mb-6">
        {t('contact_form.title')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
        {/* Nom */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#424242] mb-2">
            {t('contact_form.full_name')} *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact_form.placeholders.name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#424242] mb-2">
            {t('contact_form.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300 text-sm sm:text-base ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact_form.placeholders.email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs sm:text-sm text-red-500" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#424242] mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            {t('contact_form.phone')} <span className="text-gray-400 text-xs">{t('contact_form.optional')}</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300 text-sm sm:text-base ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact_form.placeholders.phone')}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs sm:text-sm text-red-500" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Sujet */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-[#424242] mb-2">
            {t('contact_form.subject')} *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300 text-sm sm:text-base ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
          >
            <option value="">{t('contact_form.select_subject')}</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p id="subject-error" className="mt-1 text-xs sm:text-sm text-red-500" role="alert">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Numéro de commande (si sujet lié à commande) */}
        {(formData.subject === t('contact_form.subjects.order_issue') || formData.subject === t('contact_form.subjects.return')) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label htmlFor="orderNumber" className="block text-sm font-medium text-[#424242] mb-2">
              <ShoppingBag className="w-4 h-4 inline mr-1" />
              {t('contact_form.order_number')} <span className="text-gray-400 text-xs">{t('contact_form.optional')}</span>
            </label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300 text-sm sm:text-base"
              placeholder={t('contact_form.placeholders.order_number')}
            />
          </motion.div>
        )}

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="message" className="block text-sm font-medium text-[#424242]">
              Message *
            </label>
            <span className={`text-xs ${
              messageLength > MAX_MESSAGE_LENGTH 
                ? 'text-red-500' 
                : messageLength > MAX_MESSAGE_LENGTH * 0.9 
                  ? 'text-orange-500' 
                  : 'text-gray-400'
            }`}>
              {messageLength} / {MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            maxLength={MAX_MESSAGE_LENGTH}
            className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all duration-300 resize-none text-sm sm:text-base ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('contact_form.placeholders.message')}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : 'message-help'}
          />
          {/* Barre de progression */}
          <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                messageProgress > 90 ? 'bg-red-500' : messageProgress > 75 ? 'bg-orange-500' : 'bg-[#4CAF50]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(messageProgress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {errors.message && (
            <p id="message-error" className="mt-1 text-xs sm:text-sm text-red-500" role="alert">
              {errors.message}
            </p>
          )}
          <p id="message-help" className="mt-1 text-xs text-gray-500">
            {t('contact_form.errors.message_min')}
          </p>
        </div>

        {/* Upload de fichiers */}
        <div>
          <label className="block text-sm font-medium text-[#424242] mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            {t('contact_form.attach_files')} <span className="text-gray-400 text-xs">({t('contact_form.optional')}, max {MAX_FILES} fichiers, 5MB chacun)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#4CAF50] hover:bg-[#E8F5E8] transition-all duration-300 text-sm sm:text-base"
          >
            <Upload className="w-5 h-5 text-[#4CAF50]" />
            <span className="text-[#424242]">{t('contact_form.attach_files')}</span>
          </label>
          
          {/* Liste des fichiers */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    aria-label={`${t('common.delete')} ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Erreurs de fichiers */}
          {attachmentErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachmentErrors.map((error, index) => (
                <p key={index} className="text-xs text-red-500" role="alert">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Bouton d'envoi */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          className="w-full bg-[#4CAF50] text-white py-3 sm:py-4 px-6 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#2E7D32] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>{t('contact_form.sending')}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{t('contact_form.send')}</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
