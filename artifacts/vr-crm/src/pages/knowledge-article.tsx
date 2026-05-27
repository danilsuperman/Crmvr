import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Clock, GraduationCap, Shield, Gamepad2, ShoppingCart, Users2, Video, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type Article, type ReadState, CATEGORIES, type ContentBlock, DEFAULT_ARTICLES } from "./knowledge";

function getVideoEmbed(url: string): { type: "youtube" | "vimeo" | "direct" | "unknown"; embedUrl: string } {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  if (isVideo) return { type: "direct", embedUrl: url };

  return { type: "unknown", embedUrl: url };
}

function VideoBlock({ content }: { content: string }) {
  if (!content.trim()) return null;
  const { type, embedUrl } = getVideoEmbed(content);

  if (type === "unknown") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border/50 bg-muted/10 text-muted-foreground text-xs">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Неподдерживаемый формат видео: {content}</span>
      </div>
    );
  }

  if (type === "direct") {
    return (
      <div className="rounded-xl overflow-hidden border border-border/50 bg-black aspect-video">
        <video src={embedUrl} controls className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 bg-black aspect-video">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Видео урока"
      />
    </div>
  );
}

function renderBlocks(blocks: ContentBlock[]) {
  return blocks.map((block, i) => {
    if (block.type === "video") {
      return (
        <div key={block.id || i}>
          <VideoBlock content={block.content} />
        </div>
      );
    }
    return (
      <div key={block.id || i} className="text-sm text-foreground leading-relaxed whitespace-pre-line">
        {block.content}
      </div>
    );
  });
}

const DIFF_LABEL: Record<Article["difficulty"], { label: string; cls: string }> = {
  easy: { label: "Легко", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  medium: { label: "Средне", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  hard: { label: "Сложно", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function KnowledgeArticle({ params }: { params?: { id?: string } }) {
  const [, navigate] = useLocation();
  const id = Number(params?.id);

  const [articles] = useLocalStorage<Article[]>("vrpark_knowledge_articles", DEFAULT_ARTICLES);
  const [readState, setReadState] = useLocalStorage<ReadState>("vrpark_knowledge_read", {});

  const article = articles.find(a => a.id === id);
  const isRead = article ? !!readState[article.id] : false;

  useEffect(() => {
    if (article && !isRead) {
      setReadState(s => ({ ...s, [article.id]: true }));
    }
  }, [article?.id]);

  if (!article) {
    return (
      <div className="flex flex-col h-full z-10">
        <header className="h-14 border-b border-border/50 flex items-center gap-3 px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
          <button onClick={() => navigate("/knowledge")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2 text-muted-foreground">
            <BookOpen className="w-8 h-8 opacity-30 mx-auto" />
            <p className="text-sm">Статья не найдена</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/knowledge")}>Вернуться к базе знаний</Button>
          </div>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES.find(c => c.id === article.category);
  const diff = DIFF_LABEL[article.difficulty];
  const blocks = article.blocks?.length ? article.blocks : [{ id: "legacy", type: "text" as const, content: article.content || "" }];
  const videoCount = blocks.filter(b => b.type === "video").length;

  const markRead = () => {
    setReadState(s => ({ ...s, [article.id]: true }));
    toast.success("Отмечено как прочитанное");
  };

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center gap-3 px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <button
          onClick={() => navigate("/knowledge")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> База знаний
        </button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-xs font-medium truncate">{article.title}</span>
        <div className="ml-auto flex items-center gap-2">
          {isRead
            ? <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium"><CheckCircle2 className="w-4 h-4" />Прочитано</span>
            : <Button size="sm" className="h-7 text-xs gap-1.5" onClick={markRead}><Circle className="w-3 h-3" />Отметить прочитанным</Button>}
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 md:px-6 py-6 pb-20 md:pb-6">
        <article className="max-w-2xl mx-auto space-y-6">
          {/* Article header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {cat && (
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium", cat.color)}>
                  <cat.icon className={cn("w-3.5 h-3.5", cat.color.split(" ")[0])} />
                  {cat.label}
                </div>
              )}
              <span className={cn("text-xs px-2 py-1 rounded-lg border", diff.cls)}>{diff.label}</span>
              {article.required && (
                <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">Обязательно</span>
              )}
            </div>

            <h1 className="text-2xl font-black leading-tight">{article.title}</h1>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.readTime} мин. чтения</span>
              {videoCount > 0 && (
                <span className="flex items-center gap-1 text-blue-400"><Video className="w-3.5 h-3.5" />{videoCount} {videoCount === 1 ? "видео" : "видео"}</span>
              )}
              <span>{blocks.length} {blocks.length === 1 ? "блок" : "блока"}</span>
            </div>

            <div className="h-px bg-border/50" />
          </div>

          {/* Content blocks */}
          <div className="space-y-5">
            {renderBlocks(blocks)}
          </div>

          {/* Footer */}
          <div className="h-px bg-border/50" />
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => navigate("/knowledge")}>
              <ArrowLeft className="w-3.5 h-3.5" /> К базе знаний
            </Button>
            {!isRead && (
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={markRead}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Отметить прочитанным
              </Button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
