import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { updateUserSettings } from "@/lib/energy.functions";
import { toast } from "sonner";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [tariff, setTariff] = useState<number>(8);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setFullName(user.fullName ?? "");
    setCompany(user.company ?? "");
    setCurrency(user.currency ?? "INR");
    setTariff(Number(user.tariff_per_kwh ?? 8));
    setNotif(user.notifications_enabled ?? true);
  }, [open, user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserSettings({
        data: {
          fullName,
          company,
          currency,
          tariff_per_kwh: tariff,
          notifications_enabled: notif,
          theme,
        },
      });
      await refreshUser();
      toast.success("Settings saved");
      onOpenChange(false);
    } catch (err) {
      toast.error("Couldn't save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Personalize your experience.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="appearance">Theme</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-3 pt-4">
            <Label>Color mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { v: "light", l: "Light", Icon: Sun },
                  { v: "dark", l: "Dark", Icon: Moon },
                  { v: "system", l: "System", Icon: Monitor },
                ] as const
              ).map(({ v, l, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTheme(v)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs hover:bg-accent transition-colors ${theme === v ? "border-primary bg-accent" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                  {l}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label className="text-sm">Notifications</Label>
                <p className="text-xs text-muted-foreground">Get alerted on new insights</p>
              </div>
              <Switch checked={notif} onCheckedChange={setNotif} />
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-3 pt-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Tariff per kWh ({currency})</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Used for idle-cost calculations</p>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-3 pt-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
