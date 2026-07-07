import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PresenceDot } from "../components/ui/PresenceDot";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal } from "../components/ui/Modal";
import { Toggle } from "../components/ui/Toggle";
import { Skeleton } from "../components/ui/Skeleton";
import { useReducedMotion } from "../providers";

export const KitchenSink: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleVal, setToggleVal] = useState(false);
  const [progressVal, setProgressVal] = useState(65);
  const [inputVal, setInputVal] = useState("");
  const isReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-on-background px-margin-mobile py-10 md:px-margin-desktop select-none">
      <div className="max-w-6xl mx-auto space-y-section-gap-v">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface m-0 text-left">
              Momentum Component Library
            </h1>
            <p className="text-body-sm text-on-surface-variant text-left mt-2">
              Sanity-check for all dark-theme primitive components.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] uppercase font-bold text-on-surface-variant tracking-wider">
              Reduced Motion:
            </span>
            <Badge variant={isReducedMotion ? "streak" : "default"}>
              {isReducedMotion ? "Active (No Motion)" : "Disabled (Spring Physics)"}
            </Badge>
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Section: Buttons */}
          <Card className="space-y-6">
            <h2 className="text-headline-md text-on-surface border-b border-white/5 pb-2 text-left m-0">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" disabled>Disabled Primary</Button>
              <Button variant="secondary" disabled>Disabled Secondary</Button>
            </div>
          </Card>

          {/* Section: Inputs & Toggles */}
          <Card className="space-y-6">
            <h2 className="text-headline-md text-on-surface border-b border-white/5 pb-2 text-left m-0">
              Inputs & Interactive
            </h2>
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-label-caps text-on-surface-variant">Default Text Input</label>
                <Input
                  placeholder="Enter details..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-white/5">
                <span className="text-body-sm text-on-surface font-medium">
                  Custom Status Toggle
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-on-surface-variant">
                    {toggleVal ? "On" : "Off"}
                  </span>
                  <Toggle checked={toggleVal} onChange={setToggleVal} />
                </div>
              </div>
            </div>
          </Card>

          {/* Section: Badges & Presence */}
          <Card className="space-y-6">
            <h2 className="text-headline-md text-on-surface border-b border-white/5 pb-2 text-left m-0">
              Status Badges & Presence
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Level Up</Badge>
                <Badge variant="streak">3 Day Streak</Badge>
                <Badge variant="secondary">Active User</Badge>
                <Badge variant="error">Connection Loss</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-low border border-white/5">
                <div className="flex items-center gap-3">
                  <PresenceDot status="online" />
                  <span className="text-body-sm text-on-surface">Online (Pulsing)</span>
                </div>
                <div className="flex items-center gap-3">
                  <PresenceDot status="studying" />
                  <span className="text-body-sm text-on-surface">Studying (Pulsing)</span>
                </div>
                <div className="flex items-center gap-3">
                  <PresenceDot status="away" />
                  <span className="text-body-sm text-on-surface">Away</span>
                </div>
                <div className="flex items-center gap-3">
                  <PresenceDot status="offline" />
                  <span className="text-body-sm text-on-surface">Offline</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Section: Progress & Shimmer Loading */}
          <Card className="space-y-6">
            <h2 className="text-headline-md text-on-surface border-b border-white/5 pb-2 text-left m-0">
              Progress & Skeleton
            </h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-label-caps text-on-surface-variant">
                  <span>Interactive Progress</span>
                  <span>{progressVal}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressBar progress={progressVal} variant="thin" color="indigo" className="flex-1" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressVal}
                    onChange={(e) => setProgressVal(Number(e.target.value))}
                    className="w-24 accent-primary"
                  />
                </div>
                <ProgressBar progress={progressVal} variant="thick" color="green" />
              </div>
              <div className="space-y-3 text-left">
                <span className="text-label-caps text-on-surface-variant">Shimmer Skeleton Loaders</span>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </Card>

          {/* Section: Modal & Backdrop Blur */}
          <Card className="space-y-6 md:col-span-2">
            <h2 className="text-headline-md text-on-surface border-b border-white/5 pb-2 text-left m-0">
              Modal Overlay & Card Layouts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-center items-start gap-4">
                <p className="text-body-sm text-on-surface-variant text-left">
                  Test the Backdrop blur filter, backdrop lock scroll, and spring scaling enter transition.
                </p>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Trigger Modal Dialog
                </Button>
              </div>

              {/* Glass Card Showcase */}
              <Card variant="glass" className="text-left flex flex-col justify-center gap-2">
                <h3 className="text-headline-md text-primary m-0">Glassmorphism Card</h3>
                <p className="text-body-sm text-on-surface-variant/90 leading-relaxed">
                  Backdrop filter blur with top-left highlight border. Used for priority overlays.
                </p>
              </Card>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Element */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Momentum Dialogue Header"
      >
        <div className="space-y-4 text-left">
          <p className="text-body-sm text-on-surface-variant">
            This is an example dialog displaying a backdrop-filter blur and spring animated scale entrance.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm Action</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
