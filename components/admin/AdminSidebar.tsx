'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Package, ShoppingCart } from 'lucide-react';

const menuItems = [
  { href: '/admin', icon: Store, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/ordenes', icon: ShoppingCart, label: 'Órdenes' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-56 bg-white md:border-r md:border-gray-200 md:h-screen">
      <div className="p-4 md:p-6 md:block hidden">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="flex md:flex-col md:space-y-1 justify-around md:justify-start overflow-x-auto md:overflow-x-visible px-2 md:px-3 py-2 md:py-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg relative flex-shrink-0 md:flex-shrink ${
                isActive ? 'text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              } ${
                'md:w-full w-24 flex-col md:flex-row justify-center md:justify-start'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBackground"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="w-6 h-6 md:mr-3 mb-1 md:mb-0" />
              <span className="text-xs md:text-base md:font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}