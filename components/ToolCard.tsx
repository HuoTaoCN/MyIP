import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export default function ToolCard({ href, icon: Icon, title, description, color = "blue" }: ToolCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
    indigo: "bg-indigo-50 text-indigo-600",
    pink: "bg-pink-50 text-pink-600",
    yellow: "bg-yellow-50 text-yellow-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <Link
      href={href}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[color] ?? colorMap.blue}`}>
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </Link>
  );
}
