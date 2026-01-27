# IMPLEMENATION PLAN - Change Chart Color to White

I will update the `HashChart` component to change the chart's color scheme from purple to white as requested.

## User Review Required

> [!IMPORTANT]
> I will be updating the gradient fill and tooltip text color to match the new white line color, as this is standard practice for area charts.

- **Files to Modify**: `components/HashChart.tsx`
- **Changes**:
    - Update `linearGradient` stops to use white (`#ffffff`).
    - Update `Area` stroke to use white (`#ffffff`).
    - Update `Tooltip` item text color to white (`#ffffff`).

## Proposed Changes

### `components/HashChart.tsx`

```typescript
// ... inside <defs>
<linearGradient id="colorHash" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
</linearGradient>

// ... inside <Tooltip>
<Tooltip 
  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
  itemStyle={{ color: '#ffffff', fontSize: '12px' }} // Changed from #a78bfa
  labelStyle={{ color: '#a1a1aa', fontSize: '10px', marginBottom: '4px' }}
/>

// ... inside <Area>
<Area 
  type="monotone" 
  dataKey="value" 
  stroke="#ffffff" // Changed from #8b5cf6
  strokeWidth={2}
  fillOpacity={1} 
  fill="url(#colorHash)" 
  isAnimationActive={false}
/>
```

## Verification Plan

I will verify the changes by:
1.  Running the linter/build check (implied by `npm run dev` running successfully, but I won't restart it unless needed).
2.  (Optional) Asking the user to confirm the visual change.
