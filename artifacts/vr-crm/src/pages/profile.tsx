import { User, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-14 border-b border-border/50 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-bold font-mono">Профиль</h1>
      </header>
      <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl bg-card/30">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary/60" />
            </div>
            <div>
              <p className="font-semibold">Администратор</p>
              <p className="text-sm text-muted-foreground">admin@vrpark.co</p>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary mt-1 inline-block">
                Владелец
              </span>
            </div>
          </div>

          {/* Edit form */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Имя</Label>
                <Input className="h-9 text-sm" defaultValue="Администратор" data-testid="input-profile-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input className="h-9 text-sm pl-9" defaultValue="admin@vrpark.co" data-testid="input-profile-email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Новый пароль</Label>
                <Input className="h-9 text-sm" type="password" placeholder="••••••••" data-testid="input-profile-password" />
              </div>
              <Button className="w-full mt-1" data-testid="button-save-profile">
                Сохранить изменения
              </Button>
            </CardContent>
          </Card>

          {/* Role */}
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Роль
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Владелец</p>
                  <p className="text-xs text-muted-foreground">Полный доступ ко всем функциям CRM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
