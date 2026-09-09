import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckRow, Field, Input, Radio, Select, Textarea } from "@/components/ui/field";

/**
 * There is no form anywhere in the shipped product today (feedback arrives
 * over the API, not a web form), so this is the design system's fieldClass
 * introduced from scratch rather than extracted from a repeated string. It
 * matches Card's ground and border and shares h-12 with Button md/lg, so a
 * select, an input and a button on the same row line up.
 */
const meta = {
  title: "Components/Form controls",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextField: Story = {
  render: () => (
    <div className="grid max-w-md gap-5">
      <Field label="Project slug" hint="Matches the folder under config/projects">
        <Input defaultValue="my-app" />
      </Field>
      <Field label="Ingest key">
        <Input placeholder="fbk_live_..." className="font-mono text-[13px] tracking-wide" />
      </Field>
      <Field label="MCP secret" error="This value has already been rotated once today.">
        <Input defaultValue="mcp_9f2a...c71e" className="font-mono text-[13px] tracking-wide" aria-invalid />
      </Field>
      <Field label="Slack webhook URL">
        <Input defaultValue="https://hooks.slack.com/services/T0.../B0.../..." disabled />
      </Field>
    </div>
  ),
};

export const TextareaField: Story = {
  name: "Textarea",
  render: () => (
    <div className="max-w-md">
      <Field label="Test submission" hint="Sent to POST /api/v1/feedback with platform: web">
        <Textarea defaultValue="The export button on the reports page does nothing on Safari 18. Works fine on Chrome." />
      </Field>
    </div>
  ),
};

export const SelectControl: Story = {
  name: "Select",
  render: () => (
    <div className="grid max-w-md gap-5">
      <Field label="Form">
        <Select defaultValue="bug-report">
          <option value="bug-report">Bug report</option>
          <option value="feature-request">Feature request</option>
        </Select>
      </Field>
      <Field label="Platform">
        <Select defaultValue="">
          <option value="">Platform...</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="web">Web</option>
          <option value="server">Server</option>
        </Select>
      </Field>
      <Field label="Database provider">
        <Select defaultValue="postgresql" disabled>
          <option value="postgresql">PostgreSQL</option>
          <option value="sqlite">SQLite</option>
        </Select>
      </Field>
    </div>
  ),
};

/**
 * The drift check: a select beside a text input beside a button, all on one
 * row. Same height, same background, same border. If any one is shorter or
 * greyer than the rest, the field class has drifted from the button.
 */
export const MixedRow: Story = {
  render: () => (
    <div className="grid max-w-xl gap-6">
      <div className="flex items-center gap-2">
        <Input placeholder="Project slug" className="flex-1" />
        <Select defaultValue="bug-report" className="w-44">
          <option value="bug-report">Bug report</option>
          <option value="feature-request">Feature request</option>
        </Select>
        <Button size="lg">Add project</Button>
      </div>
      <div className="flex items-center gap-2">
        <Input defaultValue="fbk_live_8k2n...q91z" className="flex-1 font-mono text-[13px]" />
        <Select defaultValue="" className="w-36">
          <option value="">Platform...</option>
          <option value="ios">iOS</option>
          <option value="web">Web</option>
        </Select>
      </div>
    </div>
  ),
};

export const CheckboxControl: Story = {
  name: "Checkbox",
  render: () => (
    <div className="grid max-w-md gap-4">
      <CheckRow control={<Checkbox defaultChecked />} label="Post to Slack" hint="Cross-post every new submission for this project" />
      <CheckRow control={<Checkbox />} label="Require an ingest key" hint="Reject submissions with no X-Feedback-Key header" />
      <CheckRow control={<Checkbox defaultChecked />} label="Verify end-user JWTs" />
      <CheckRow control={<Checkbox disabled />} label="MongoDB provider" hint="On the roadmap, not selectable yet" />
    </div>
  ),
};

export const RadioControl: Story = {
  name: "Radio",
  render: () => (
    <fieldset className="grid max-w-md gap-3">
      <legend className="mb-1 text-sm font-medium text-fg">Database provider</legend>
      <CheckRow control={<Radio name="db" defaultChecked />} label="PostgreSQL" hint="The production default" />
      <CheckRow control={<Radio name="db" />} label="SQLite" hint="Single container, zero external dependencies" />
      <CheckRow control={<Radio name="db" disabled />} label="MongoDB" hint="Coming later" />
    </fieldset>
  ),
};

function ToggleDemo() {
  const [requireApproval, setRequireApproval] = useState(false);
  return (
    <div className="grid max-w-md gap-4">
      <CheckRow
        control={<Checkbox checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} />}
        label="End-user JWT required"
        hint="Locks the platform field to the one in the verified token"
      />
      <Field label="Platform" hint={requireApproval ? "Taken from the JWT, not editable" : undefined}>
        <Select defaultValue="ios" disabled={requireApproval}>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="web">Web</option>
        </Select>
      </Field>
    </div>
  );
}

/** The one interactive story: JWT verification disabling the platform select it would otherwise pin. */
export const Toggle: Story = {
  render: () => <ToggleDemo />,
};
