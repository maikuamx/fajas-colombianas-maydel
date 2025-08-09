'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { sendOrderConfirmationEmail } from '../../lib/emailService';

interface PaymentSuccessProps {
  orderId: string;
  emailData?: any;
}

export default function PaymentSuccess({ orderId, emailData }: PaymentSuccessProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [supabase]);

  // Send email on client side if we have email data
  useEffect(() => {
    if (emailData && !emailSent) {
      const sendEmail = async () => {
        try {
          await sendOrderConfirmationEmail(emailData);
          setEmailSent(true);
          console.log('Email sent successfully');
        } catch (error) {
          console.error('Error sending email:', error);
        }
      };
      sendEmail();
    }
  }, [emailData, emailSent]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          ¡Pago Exitoso!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-2"
        >
          Tu pedido ha sido procesado correctamente.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 mb-8"
        >
          Número de pedido: <span className="font-mono">{orderId.slice(0, 8)}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {isAuthenticated ? (
            <Link
              href="/perfil"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Ver Mis Pedidos
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Iniciar Sesión para Ver Pedidos
            </Link>
          )}

          <Link
            href="/"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Seguir Comprando
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 bg-green-50 rounded-lg"
        >
          <p className="text-sm text-green-800">
            {/* Conditional message based on user type */}
            Recibirás un correo de confirmación con los detalles de tu pedido (si proporcionaste tu email).
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}