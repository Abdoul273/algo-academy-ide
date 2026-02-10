import { useIDE } from '@/contexts/IDEContext';
import { ideThemes, fontOptions } from '@/lib/themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ open, onClose }: Props) {
  const { settings, updateSettings } = useIDE();

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-foreground">Parametres</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-6 py-2 pr-2">
            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Theme ({ideThemes.length} disponibles)</Label>
              <div className="grid grid-cols-2 gap-2">
                {ideThemes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ theme: t })}
                    className={`p-3 rounded-md border text-left transition-all text-sm ${
                      settings.theme.id === t.id
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ background: t.monacoColors.editorBg }} />
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <span className="text-xs opacity-60 mt-0.5 block">{t.type === 'dark' ? 'Sombre' : 'Clair'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Police</Label>
              <Select value={settings.fontFamily} onValueChange={v => updateSettings({ fontFamily: v })}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {fontOptions.map(f => (
                    <SelectItem key={f.value} value={f.value} className="text-popover-foreground">
                      <span style={{ fontFamily: f.value }}>{f.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Taille de police : {settings.fontSize}px
              </Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([v]) => updateSettings({ fontSize: v })}
                min={10}
                max={24}
                step={1}
                className="py-2"
              />
            </div>

            {/* Line Height */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Interligne : {settings.lineHeight.toFixed(1)}
              </Label>
              <Slider
                value={[settings.lineHeight * 10]}
                onValueChange={([v]) => updateSettings({ lineHeight: v / 10 })}
                min={12}
                max={24}
                step={1}
                className="py-2"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm">Minimap</Label>
                <Switch checked={settings.minimap} onCheckedChange={v => updateSettings({ minimap: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm">Retour a la ligne</Label>
                <Switch checked={settings.wordWrap} onCheckedChange={v => updateSettings({ wordWrap: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm">Sauvegarde automatique</Label>
                <Switch checked={settings.autoSave} onCheckedChange={v => updateSettings({ autoSave: v })} />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Apercu</Label>
              <div className="rounded-md border border-border p-4 bg-ide-editor">
                <pre
                  className="text-sm"
                  style={{
                    fontFamily: settings.fontFamily,
                    fontSize: settings.fontSize,
                    lineHeight: settings.lineHeight,
                  }}
                >
                  <span className="text-syntax-keyword font-bold">Algorithme</span>{' '}
                  <span className="text-syntax-variable">Apercu</span>{'\n'}
                  <span className="text-syntax-keyword font-bold">Variables</span>{'\n'}
                  {'    '}<span className="text-syntax-variable">x</span>{' : '}
                  <span className="text-syntax-type italic">entier</span>{'\n'}
                  <span className="text-syntax-keyword font-bold">Debut</span>{'\n'}
                  {'    '}<span className="text-syntax-function">Afficher</span>
                  {'('}<span className="text-syntax-string">"Bonjour"</span>{')\n'}
                  <span className="text-syntax-keyword font-bold">Fin</span>
                </pre>
              </div>
            </div>

            {/* Keyboard shortcuts info */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Raccourcis clavier</Label>
              <div className="rounded-md border border-border p-3 space-y-1.5 text-xs">
                {[
                  ['Ctrl+S', 'Sauvegarder'],
                  ['Ctrl+N', 'Nouveau fichier'],
                  ['Ctrl+O', 'Ouvrir fichier'],
                  ['F5', 'Executer'],
                  ['Shift+F5', 'Arreter'],
                  ['Ctrl+L', 'Effacer console'],
                  ['Ctrl+D', 'Selection multiple'],
                  ['Ctrl+/', 'Commenter/Decommenter'],
                  ['Ctrl+Z / Ctrl+Y', 'Annuler / Retablir'],
                  ['Ctrl+F', 'Rechercher'],
                  ['Ctrl+H', 'Rechercher et remplacer'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{v}</span>
                    <kbd className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-[10px] font-code">{k}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
