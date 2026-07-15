---
title: "Adding WASD Movement to the Vanilla Game"
date: 2026-07-14T18:00:00+08:00
params:
  status: hatch
  summary: "Teaching an old click-to-move engine to listen to the keyboard — the two key engine anchors are verified by reverse engineering, the approach is settled, and it's waiting to be written into Mikuro Runtime."
---

At its core, Torchlight II's movement is driven by **order-driven "move to point" + walk-grid A\* pathfinding**: you click the ground, the engine receives a "move there" order, and everything after that — pathfinding, obstacle avoidance, turning, footwork — is its own business. The PC version simply has no "directional movement" input path — there is no gamepad support, and the keyboard only handles skills and menus.

So the WASD idea is not to poke at coordinates, but to **speak the engine's own language**: every frame, combine the pressed direction keys (together with the camera facing) into a nearby target point, and issue the engine a "move to point" order. Going through the order-issuing path, all the benefits come for free —

- **Pathfinding, collision, ground snapping, turning, and walk animations** are all handled by the engine's native logic — nothing needs reinventing;
- **Multiplayer-safe**: move orders are exactly the kind of thing that already gets network-synced, whereas rewriting coordinates directly is guaranteed to desync.

The groundwork is done (verified by reverse engineering in IDA):

- **How to get the local player**: the game-wide game-state singleton is referenced from over two thousand code sites, and the local player's unit pointer hangs off a fixed slot on it; the evidence comes from the trigger-zone system's native "is this the local player" comparison — solid.
- **Where "move to point" gets ordered**: the engine has a per-unit pathfinding order function — the start point is taken automatically from the unit's current position, and feeding it a target XZ runs A\*, sets the movement state, and drives the turn — that is the door WASD will knock on every frame.

The delivery vehicle is the existing **Mikuro Runtime** (the d3d9 proxy layer — cooldown reduction and loot filtering are already running on it); WASD will join as a new component. The hurdles still ahead: whether issuing a move order continuously produces a smooth walking animation, the feel of key throttling and stop-on-release, and calibrating the synthesis of camera view and input direction — all of which will have to be settled by in-game testing.

*Fourteen years of clicking the floor with the mouse — time to put the left hand to work.*
