'use client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Platform configuration and preferences</p>
        </div>
        <div className="max-w-2xl space-y-4">
          <Card className="bg-white border-border shadow-none">
            <CardHeader className="pb-0 pt-4 px-5">
              <h2 className="text-[14px] font-semibold text-foreground">Organization</h2>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Organization Name</Label>
                <Input defaultValue="Aerosepct Inc." className="h-9 text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Admin Email</Label>
                <Input defaultValue="admin@flightdent.io" className="h-9 text-[13px]" />
              </div>
              <Button size="sm">Save Changes</Button>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-none">
            <CardHeader className="pb-0 pt-4 px-5">
              <h2 className="text-[14px] font-semibold text-foreground">Notifications</h2>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-4 space-y-4">
              {[
                { label: 'Critical defect alerts', desc: 'Receive instant alerts for critical severity defects' },
                { label: 'Mission status updates', desc: 'Notify when missions start, complete, or fail' },
                { label: 'Processing complete', desc: 'Alert when AI processing finishes' },
                { label: 'Weekly summary report', desc: 'Weekly digest of all inspection activity' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{item.label}</div>
                    <div className="text-[12px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
