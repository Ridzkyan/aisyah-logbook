import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, GraduationCap, Heart } from 'lucide-react';

export default function Home() {
  const templates = [
    {
      type: 'KKN',
      title: 'KKN',
      fullTitle: 'Kuliah Kerja Nyata',
      description: 'Template logbook untuk kegiatan KKN dengan format hari/tanggal, program kerja, dan deskripsi aktivitas.',
      icon: GraduationCap,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      type: 'PLP',
      title: 'PLP',
      fullTitle: 'Pengenalan Lapangan Persekolahan',
      description: 'Template logbook PLP dengan tracking jam pembelajaran, administrasi, dan adaptasi teknologi.',
      icon: BookOpen,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      type: 'AM',
      title: 'AM',
      fullTitle: 'Asistensi Mengajar',
      description: 'Template logbook Asistensi Mengajar dengan 5 kategori jam dan deskripsi aktivitas lengkap.',
      icon: FileText,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-500 neo-border-b border-b-[6px]">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 20px), repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 20px)' }} />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="neo-border neo-shadow-lg bg-pink-500 p-3 rotate-3">
                <Heart className="h-10 w-10 fill-white text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight" style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}>
                LogBook
              </h1>
            </div>
            <div className="mb-4 inline-block neo-border neo-shadow-lg bg-yellow-400 px-6 py-3 -rotate-2">
              <p className="text-xl md:text-3xl font-black text-black uppercase">
                Untuk Aisyah dari Ridho 💙
              </p>
            </div>
            <p className="mb-3 text-2xl md:text-3xl font-bold text-white">
              Buat Logbook KKN/PLP/AM
            </p>
            <p className="mb-10 text-xl md:text-2xl font-bold text-blue-100">
              dalam Hitungan Menit ⚡
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg" asChild>
                <a href="#templates">Mulai Sekarang!</a>
              </Button>
              <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50 text-lg" asChild>
                <Link href="/history">Lihat Riwayat</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="neo-border neo-shadow-lg bg-white p-6 neo-lift">
            <div className="mb-4 inline-block neo-border neo-shadow bg-blue-500 p-3">
              <span className="text-4xl">💾</span>
            </div>
            <h3 className="mb-3 text-xl font-black uppercase">Auto-Save</h3>
            <p className="font-medium text-gray-700">
              Data tersimpan otomatis di perangkat kamu, tidak perlu database.
            </p>
          </div>
          <div className="neo-border neo-shadow-lg bg-white p-6 neo-lift">
            <div className="mb-4 inline-block neo-border neo-shadow bg-green-500 p-3">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="mb-3 text-xl font-black uppercase">Export Word & PDF</h3>
            <p className="font-medium text-gray-700">
              Export logbook ke format Word atau PDF dengan layout yang rapi.
            </p>
          </div>
          <div className="neo-border neo-shadow-lg bg-white p-6 neo-lift">
            <div className="mb-4 inline-block neo-border neo-shadow bg-pink-500 p-3">
              <span className="text-4xl">⚡</span>
            </div>
            <h3 className="mb-3 text-xl font-black uppercase">Cepat & Mudah</h3>
            <p className="font-medium text-gray-700">
              Interface modern dan mudah digunakan, bisa diakses dari HP atau laptop.
            </p>
          </div>
        </div>

        {/* Templates Section */}
        <div id="templates" className="scroll-mt-20">
          <div className="mb-10 text-center">
            <div className="inline-block neo-border neo-shadow-xl bg-yellow-400 px-8 py-4 rotate-1 mb-4">
              <h2 className="text-4xl md:text-5xl font-black text-black uppercase">
                Pilih Template
              </h2>
            </div>
            <p className="text-xl font-bold text-gray-700">Mulai dengan template yang sesuai kebutuhanmu!</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {templates.map((template, idx) => {
              const Icon = template.icon;
              const rotation = idx === 0 ? '-rotate-1' : idx === 1 ? 'rotate-1' : '-rotate-2';
              return (
                <Link key={template.type} href={`/form/${template.type}`}>
                  <div className={`neo-border neo-shadow-lg bg-white hover:neo-shadow-xl transition-all neo-lift cursor-pointer h-full ${rotation}`}>
                    <div className={`neo-border-b border-b-[3px] ${template.color} p-6`}>
                      <Icon className="h-12 w-12 text-white" strokeWidth={3} />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-3xl font-black uppercase">{template.title}</h3>
                      <p className="mb-4 text-lg font-bold text-gray-700">
                        {template.fullTitle}
                      </p>
                      <p className="mb-6 font-medium text-gray-600">
                        {template.description}
                      </p>
                      <Button className={`w-full ${template.color} text-white ${template.hoverColor}`}>
                        Buat Logbook {template.type}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="neo-border-t border-t-[6px] bg-white py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 inline-block neo-border neo-shadow bg-pink-500 px-6 py-3 -rotate-2">
            <p className="flex items-center gap-2 text-lg font-black text-white uppercase">
              Made with <Heart className="h-5 w-5 fill-white" /> by Ridho for Aisyah
            </p>
          </div>
          <p className="font-bold text-gray-600">
            © 2026 LogBook Aisyah. Data tersimpan lokal di perangkat kamu.
          </p>
        </div>
      </footer>
    </div>
  );
}
