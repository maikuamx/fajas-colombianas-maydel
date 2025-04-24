import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Image
              src="/logo.png"
              alt="Maydel Fajas"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <p className="text-gray-600">
              Fajas colombianas de alta calidad para realzar tu figura con comodidad y estilo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/productos" className="text-gray-600 hover:text-primary transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-gray-600 hover:text-primary transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-600 hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Ciudad de México, México</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-primary" />
                <span>+52 (55) 1234-5678</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-5 h-5 text-primary" />
                <span>contacto@maydelfajas.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              >
                <Facebook className="w-5 h-5 text-primary" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              >
                <Instagram className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Maydel Fajas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}