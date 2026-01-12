"use client"

import type React from "react"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useSettings, type CustomCommand } from "@/lib/settings-context"
import { translations } from "@/lib/i18n/translations"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accessibility,
  Volume2,
  Palette,
  Command,
  Plus,
  Trash2,
  Edit,
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
  RotateCcw,
  Eye,
  Type,
  Sparkles,
  Keyboard,
  MessageSquare,
  Globe,
  Gauge,
  Mic,
  Radio,
} from "lucide-react"
import Link from "next/link"

interface SettingsSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <section
      className="glass rounded-2xl p-6 space-y-6"
      aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-glow-secondary flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div>
          <h2
            id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4 pl-14">{children}</div>
    </section>
  )
}

interface SettingRowProps {
  icon: React.ReactNode
  label: string
  description: string
  children: React.ReactNode
  htmlFor?: string
}

function SettingRow({ icon, label, description, children, htmlFor }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0">
      <div className="flex items-start gap-3 flex-1">
        <div
          className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 mt-0.5"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex-1">
          <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground cursor-pointer">
            {label}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export function SettingsInterface() {
  const { settings, updateSettings, addCommand, updateCommand, deleteCommand, resetSettings } = useSettings()
  const { theme, setTheme } = useTheme()
  const t = translations.settings
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<CustomCommand | null>(null)
  const [newCommand, setNewCommand] = useState({ phrase: "", action: "", url: "", enabled: true })

  const handleSaveCommand = () => {
    if (editingCommand) {
      updateCommand(editingCommand.id, newCommand)
    } else {
      addCommand(newCommand)
    }
    setNewCommand({ phrase: "", action: "", url: "", enabled: true })
    setEditingCommand(null)
    setIsCommandDialogOpen(false)
  }

  const handleEditCommand = (command: CustomCommand) => {
    setEditingCommand(command)
    setNewCommand({ phrase: command.phrase, action: command.action, url: command.url || "", enabled: command.enabled })
    setIsCommandDialogOpen(true)
  }

  const handleDeleteCommand = (id: string) => {
    deleteCommand(id)
  }

  const getVoiceSpeedValue = () => {
    switch (settings.voiceSpeed) {
      case "slow":
        return [0]
      case "normal":
        return [50]
      case "fast":
        return [100]
      default:
        return [50]
    }
  }

  const handleVoiceSpeedChange = (value: number[]) => {
    if (value[0] <= 25) updateSettings({ voiceSpeed: "slow" })
    else if (value[0] <= 75) updateSettings({ voiceSpeed: "normal" })
    else updateSettings({ voiceSpeed: "fast" })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="focus-visible-ring">
            <Link href="/app" aria-label="Volver a la búsqueda">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>

        {/* Accessibility Section */}
        <SettingsSection
          icon={<Accessibility className="w-5 h-5 text-accent-foreground" />}
          title={t.accessibility}
          description={t.accessibilityDesc}
        >
          <SettingRow
            icon={<Eye className="w-4 h-4 text-muted-foreground" />}
            label={t.screenReader}
            description={t.screenReaderDesc}
            htmlFor="screen-reader"
          >
            <Switch
              id="screen-reader"
              checked={settings.screenReaderOptimized}
              onCheckedChange={(checked) => updateSettings({ screenReaderOptimized: checked })}
              aria-describedby="screen-reader-desc"
            />
          </SettingRow>

          <SettingRow
            icon={<Sparkles className="w-4 h-4 text-muted-foreground" />}
            label={t.highContrast}
            description={t.highContrastDesc}
            htmlFor="high-contrast"
          >
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
            />
          </SettingRow>

          <SettingRow
            icon={<Type className="w-4 h-4 text-muted-foreground" />}
            label={t.largeText}
            description={t.largeTextDesc}
            htmlFor="large-text"
          >
            <Switch
              id="large-text"
              checked={settings.largeText}
              onCheckedChange={(checked) => updateSettings({ largeText: checked })}
            />
          </SettingRow>

          <SettingRow
            icon={<Gauge className="w-4 h-4 text-muted-foreground" />}
            label={t.reducedMotion}
            description={t.reducedMotionDesc}
            htmlFor="reduced-motion"
          >
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            />
          </SettingRow>

          <SettingRow
            icon={<Keyboard className="w-4 h-4 text-muted-foreground" />}
            label={t.keyboardNavigation}
            description={t.keyboardNavigationDesc}
            htmlFor="keyboard-nav"
          >
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
            />
          </SettingRow>

          <SettingRow
            icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
            label={t.voiceFeedback}
            description={t.voiceFeedbackDesc}
            htmlFor="voice-feedback"
          >
            <Switch
              id="voice-feedback"
              checked={settings.voiceFeedback}
              onCheckedChange={(checked) => updateSettings({ voiceFeedback: checked })}
            />
          </SettingRow>
        </SettingsSection>

        {/* Voice Section */}
        <SettingsSection
          icon={<Volume2 className="w-5 h-5 text-accent-foreground" />}
          title={t.voice}
          description={t.voiceDesc}
        >
          <SettingRow
            icon={<Globe className="w-4 h-4 text-muted-foreground" />}
            label={t.language}
            description={t.languageDesc}
            htmlFor="language-select"
          >
            <Select
              value={settings.language}
              onValueChange={(value: "es-ES" | "en-US") => updateSettings({ language: value })}
            >
              <SelectTrigger id="language-select" className="w-32 focus-visible-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es-ES">{t.spanish}</SelectItem>
                <SelectItem value="en-US">{t.english}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            icon={<Gauge className="w-4 h-4 text-muted-foreground" />}
            label={t.voiceSpeed}
            description={t.voiceSpeedDesc}
            htmlFor="voice-speed"
          >
            <div className="flex items-center gap-3 w-48">
              <span className="text-xs text-muted-foreground">{t.slow}</span>
              <Slider
                id="voice-speed"
                value={getVoiceSpeedValue()}
                onValueChange={handleVoiceSpeedChange}
                max={100}
                step={50}
                className="flex-1"
                aria-label={t.voiceSpeed}
              />
              <span className="text-xs text-muted-foreground">{t.fast}</span>
            </div>
          </SettingRow>

          <SettingRow
            icon={<Mic className="w-4 h-4 text-muted-foreground" />}
            label={t.autoListen}
            description={t.autoListenDesc}
            htmlFor="auto-listen"
          >
            <Switch
              id="auto-listen"
              checked={settings.autoListen}
              onCheckedChange={(checked) => updateSettings({ autoListen: checked })}
            />
          </SettingRow>

          <SettingRow
            icon={<Radio className="w-4 h-4 text-muted-foreground" />}
            label={t.continuousListening}
            description={t.continuousListeningDesc}
            htmlFor="continuous-listening"
          >
            <Switch
              id="continuous-listening"
              checked={settings.continuousListening}
              onCheckedChange={(checked) => updateSettings({ continuousListening: checked })}
            />
          </SettingRow>
        </SettingsSection>

        {/* Custom Commands Section */}
        <SettingsSection
          icon={<Command className="w-5 h-5 text-accent-foreground" />}
          title={t.commands}
          description={t.commandsDesc}
        >
          {settings.customCommands.length === 0 ? (
            <div className="text-center py-8">
              <Command className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">{t.noCommands}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{t.noCommandsDesc}</p>
            </div>
          ) : (
            <ul className="space-y-2" role="list" aria-label="Lista de comandos personalizados">
              {settings.customCommands.map((command) => (
                <li
                  key={command.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">"{command.phrase}"</p>
                    <p className="text-xs text-muted-foreground truncate">{command.action}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={command.enabled}
                      onCheckedChange={(checked) => updateCommand(command.id, { enabled: checked })}
                      aria-label={`Activar comando: ${command.phrase}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 focus-visible-ring"
                      onClick={() => handleEditCommand(command)}
                      aria-label={`Editar comando: ${command.phrase}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive focus-visible-ring"
                      onClick={() => handleDeleteCommand(command.id)}
                      aria-label={`Eliminar comando: ${command.phrase}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Dialog open={isCommandDialogOpen} onOpenChange={setIsCommandDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-4 focus-visible-ring bg-transparent"
                onClick={() => {
                  setEditingCommand(null)
                  setNewCommand({ phrase: "", action: "", url: "", enabled: true })
                }}
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                {t.addCommand}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50">
              <DialogHeader>
                <DialogTitle>{editingCommand ? t.editCommand : t.addCommand}</DialogTitle>
                <DialogDescription>{t.commandPhraseDesc}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="command-phrase">{t.commandPhrase}</Label>
                  <Input
                    id="command-phrase"
                    placeholder="Abrir correo"
                    value={newCommand.phrase}
                    onChange={(e) => setNewCommand({ ...newCommand, phrase: e.target.value })}
                    className="focus-visible-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="command-action">{t.commandAction}</Label>
                  <Input
                    id="command-action"
                    placeholder="Abre la bandeja de entrada de Gmail"
                    value={newCommand.action}
                    onChange={(e) => setNewCommand({ ...newCommand, action: e.target.value })}
                    className="focus-visible-ring"
                  />
                  <p className="text-xs text-muted-foreground">{t.commandActionDesc}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="command-url">{t.commandUrl}</Label>
                  <Input
                    id="command-url"
                    placeholder="https://mail.google.com"
                    value={newCommand.url}
                    onChange={(e) => setNewCommand({ ...newCommand, url: e.target.value })}
                    className="focus-visible-ring"
                  />
                  <p className="text-xs text-muted-foreground">{t.commandUrlDesc}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCommandDialogOpen(false)}>
                  {translations.common.cancel}
                </Button>
                <Button onClick={handleSaveCommand} disabled={!newCommand.phrase.trim() || !newCommand.action.trim()}>
                  {translations.common.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection
          icon={<Palette className="w-5 h-5 text-accent-foreground" />}
          title={t.appearance}
          description={t.appearanceDesc}
        >
          <div className="py-3">
            <Label className="text-sm font-medium text-foreground mb-3 block">{t.theme}</Label>
            <p className="text-xs text-muted-foreground mb-4">{t.themeDesc}</p>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label={t.theme}>
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all focus-visible-ring ${
                  theme === "light" ? "border-accent bg-accent/10" : "border-border/50 hover:border-border"
                }`}
                role="radio"
                aria-checked={theme === "light"}
              >
                <Sun className="w-6 h-6" aria-hidden="true" />
                <span className="text-sm font-medium">{t.themeLight}</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all focus-visible-ring ${
                  theme === "dark" ? "border-accent bg-accent/10" : "border-border/50 hover:border-border"
                }`}
                role="radio"
                aria-checked={theme === "dark"}
              >
                <Moon className="w-6 h-6" aria-hidden="true" />
                <span className="text-sm font-medium">{t.themeDark}</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all focus-visible-ring ${
                  theme === "system" ? "border-accent bg-accent/10" : "border-border/50 hover:border-border"
                }`}
                role="radio"
                aria-checked={theme === "system"}
              >
                <Monitor className="w-6 h-6" aria-hidden="true" />
                <span className="text-sm font-medium">{t.themeSystem}</span>
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Reset Section */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive focus-visible-ring bg-transparent"
            onClick={resetSettings}
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            {t.resetSettings}
          </Button>
        </div>
      </div>
    </div>
  )
}
