'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PaymentSuccessProps {
  orderId: string;
}

export default function PaymentSuccess({ orderId }: PaymentSuccessProps) {
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
          <Link
            href="/perfil"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            Ver Mis Pedidos
          </Link>

          <Link
            href="/productos"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Seguir Comprando
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-green-50 rounded-lg"
        >
          <p className="text-sm text-green-800">
            Recibirás un correo de confirmación con los detalles de tu pedido.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}