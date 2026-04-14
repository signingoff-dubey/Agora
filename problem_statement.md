# Problem Statement

## The Problem

Single-model AI reasoning is a one-pass process. It cannot disagree with itself, catch its own blind spots mid-thought, or handle competing constraints in parallel. A single model finishes its answer in one go — there's no built-in mechanism for self-review, cross-examination, or genuine collaboration with other perspectives.

## Who Is Affected

Developers, researchers, and power users who need high-quality reasoning on complex problems. Anyone who has asked an AI a nuanced question and received a confident but flawed answer — lacking any internal check or alternative perspective that could catch the error before it reaches the user.

## Why Existing Solutions Fail

Existing "multi-agent" systems are just sequential pipelines: Agent A finishes, then Agent B starts. This is collaboration in name only — it's a waterfall with extra branding. Each agent waits for the previous one to complete, reacting only to final outputs, not to in-progress thinking. There's no concurrency, no reactivity, and no genuine exchange of ideas.

## Our Solution

Agora — a locally-hosted multi-agent reasoning system where multiple AI models run simultaneously on the same problem. They share a live workspace, react to each other's partial outputs mid-thought, and converge on answers through genuine back-and-forth. The user sees every agent thinking, reacting, and passing outputs in real time. Conflicts are detected and surfaced explicitly — not hidden and auto-resolved.

## Definition of Success

- All agents start within 500ms of each other
- Board updates visible within 1s of agent post
- At least one reactive post per session (agent reacting to a peer)
- Thinking indicators show during inference
- Send/receive arrows correctly reflect data flow
- Newly pulled Ollama models detected on page refresh