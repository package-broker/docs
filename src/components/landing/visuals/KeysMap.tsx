import {useId, type ComponentType} from 'react';
import {ArrowDown, ArrowRight, KeyRound, Laptop, Lock, MessageSquare, Server} from 'lucide-react';
import styles from './KeysMap.module.css';

type Icon = ComponentType<{x?: number; y?: number; width?: number; height?: number; className?: string; strokeWidth?: number}>;
type Kind = 'today' | 'broker';
type Geo = {W: number; narrow: boolean};

const HOLDER_H = 56;
const TOP_Y = 0;
const BOX_Y = 92;
const CHIP_H = 44;
const CHIP_GAP = 10;
const BOX_PAD_TOP = 36;
const BOX_PAD_BOTTOM = 30;
const BOX_H = BOX_PAD_TOP + 2 * CHIP_H + CHIP_GAP + BOX_PAD_BOTTOM;
const BOTTOM_Y = BOX_Y + BOX_H + 32;
const H = BOTTOM_Y + HOLDER_H;

const keys = [
  {client: 'client-a', vendor: 'Marketplace'},
  {client: 'client-b', vendor: 'Marketplace'},
  {client: 'client-b', vendor: 'vendor-a'},
  {client: 'client-c', vendor: 'vendor-b'},
];

const tilt = [-5, 4, 3, -4];
const jitter = [[-10, -6], [12, 4], [-4, 8], [8, -4]];

function layout({W}: Geo) {
  const gap = 10;
  const hw = (W - 2 * gap) / 3;
  const holders = [
    {x: 0, y: TOP_Y},
    {x: hw + gap, y: TOP_Y},
    {x: 2 * (hw + gap), y: TOP_Y},
    {x: 0, y: BOTTOM_Y},
    {x: W - hw, y: BOTTOM_Y},
  ];
  const cw = Math.min(150, (W - 3 * 16) / 2);
  const gridW = 2 * cw + CHIP_GAP;
  const gx = (W - gridW) / 2;
  const chips = keys.map((_, i) => ({
    x: gx + (i % 2) * (cw + CHIP_GAP),
    y: BOX_Y + BOX_PAD_TOP + Math.floor(i / 2) * (CHIP_H + CHIP_GAP),
  }));
  return {hw, holders, cw, chips, box: {x: 8, w: W - 16}};
}

function Holder({x, y, w, icon: I, title, sub, tone}: {x: number; y: number; w: number; icon: Icon; title: string; sub: string; tone: 'danger' | 'token' | 'quiet'}) {
  const cls = tone === 'token' ? styles.holderToken : tone === 'danger' ? styles.holderDanger : styles.holderQuiet;
  return (
    <g>
      <rect className={cls} x={x} y={y} width={w} height={HOLDER_H} rx={8}/>
      <I x={x + 10} y={y + 10} width={16} height={16} className={styles.icon} strokeWidth={2}/>
      <text className={styles.title} x={x + 32} y={y + 23}>{title}</text>
      <text className={tone === 'token' ? styles.token : tone === 'danger' ? styles.subDanger : styles.sub} x={x + 10} y={y + 44}>{sub}</text>
    </g>
  );
}

function Chip({x, y, w, i, kind}: {x: number; y: number; w: number; i: number; kind: Kind}) {
  const loose = kind === 'today';
  const [dx, dy] = loose ? jitter[i] : [0, 0];
  const cx = x + w / 2;
  const cy = y + CHIP_H / 2;
  const t = loose ? `translate(${dx} ${dy}) rotate(${tilt[i]} ${cx} ${cy})` : undefined;
  return (
    <g transform={t}>
      <rect className={loose ? styles.chipLoose : styles.chipSafe} x={x} y={y} width={w} height={CHIP_H} rx={8}/>
      <KeyRound x={x + 10} y={y + 14} width={16} height={16} className={loose ? styles.keyLoose : styles.keySafe} strokeWidth={2}/>
      <text className={styles.chipClient} x={x + 34} y={y + 19}>{keys[i].client}</text>
      <text className={styles.chipVendor} x={x + 34} y={y + 35}>{keys[i].vendor}</text>
    </g>
  );
}

const anchors = (h: {x: number; y: number}, w: number) => ({x: h.x + w / 2, y: h.y === TOP_Y ? h.y + HOLDER_H : h.y});

function Panel({geo, kind, arrowId}: {geo: Geo; kind: Kind; arrowId: string}) {
  const {W, narrow} = geo;
  const {hw, holders, cw, chips, box} = layout(geo);
  const today = kind === 'today';
  const laptop = narrow ? ['Developer', 'Developer', 'Freelancer'] : ['Developer laptop', 'Developer laptop', 'Freelancer laptop'];
  const holderMeta: {icon: Icon; title: string; sub: string; tone: 'danger' | 'token' | 'quiet'}[] = today
    ? [
        {icon: Laptop, title: laptop[0], sub: 'auth.json', tone: 'danger'},
        {icon: Laptop, title: laptop[1], sub: 'auth.json', tone: 'danger'},
        {icon: Laptop, title: laptop[2], sub: 'auth.json', tone: 'danger'},
        {icon: Server, title: 'CI pipeline', sub: narrow ? 'variables' : 'CI variables', tone: 'danger'},
        {icon: MessageSquare, title: 'Team chat', sub: 'pasted keys', tone: 'danger'},
      ]
    : [
        {icon: Laptop, title: laptop[0], sub: 'pb_pat_…', tone: 'token'},
        {icon: Laptop, title: laptop[1], sub: 'pb_pat_…', tone: 'token'},
        {icon: Laptop, title: laptop[2], sub: narrow ? 'pb_pat_…' : 'pb_pat_… client-b', tone: 'token'},
        {icon: Server, title: 'CI pipeline', sub: 'pb_svc_…', tone: 'token'},
        {icon: MessageSquare, title: 'Team chat', sub: narrow ? 'no keys' : 'no client keys', tone: 'quiet'},
      ];

  const links: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 0], [1, 2], [1, 3], [2, 1], [2, 2], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [4, 1], [4, 3], [4, 0]];
  const chipCenter = (i: number) => ({x: chips[i].x + cw / 2 + jitter[i][0], y: chips[i].y + CHIP_H / 2 + jitter[i][1]});

  return (
    <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} className={styles.svg} aria-hidden="true" focusable="false">
      {today && links.map(([h, c], n) => {
        const a = anchors(holders[h], hw);
        const b = chipCenter(c);
        const bend = (n % 3 - 1) * 40;
        return <path key={n} className={styles.tangle} d={`M${a.x} ${a.y}C${a.x + bend} ${(a.y + b.y) / 2} ${b.x - bend} ${(a.y + b.y) / 2} ${b.x} ${b.y}`}/>;
      })}

      {!today && (
        <>
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path className={styles.arrowHead} d="M0 0 10 5 0 10z"/>
            </marker>
          </defs>
          <rect className={styles.broker} x={box.x} y={BOX_Y} width={box.w} height={BOX_H} rx={12}/>
          <Lock x={box.x + 12} y={BOX_Y + 10} width={16} height={16} className={styles.lock} strokeWidth={2.25}/>
          <text className={styles.brokerTitle} x={box.x + 34} y={BOX_Y + 23}>Package Broker</text>
          <text className={styles.brokerNote} x={box.x + box.w / 2} y={BOX_Y + BOX_H - 11} textAnchor="middle">encrypted with a master key you hold, per client project</text>
          {holders.slice(0, 4).map((h, i) => {
            const a = anchors(h, hw);
            const top = h.y === TOP_Y;
            const tx = Math.min(Math.max(a.x, box.x + 24), box.x + box.w - 24);
            const ty = top ? BOX_Y - 2 : BOX_Y + BOX_H + 2;
            const d = a.x === tx ? `M${a.x} ${a.y}V${ty}` : `M${a.x} ${a.y}V${(a.y + ty) / 2}H${tx}V${ty}`;
            return <path key={i} className={styles.flow} d={d} markerEnd={`url(#${arrowId})`}/>;
          })}
        </>
      )}

      {chips.map((c, i) => <Chip key={i} x={c.x} y={c.y} w={cw} i={i} kind={kind}/>)}
      {holders.map((h, i) => <Holder key={i} x={h.x} y={h.y} w={hw} {...holderMeta[i]}/>)}
    </svg>
  );
}

function Side({kind, idBase}: {kind: Kind; idBase: string}) {
  const today = kind === 'today';
  return (
    <div className={`${styles.side} ${today ? styles.sideToday : styles.sideBroker}`} aria-hidden="true">
      <p className={styles.heading}>
        <span className={today ? styles.dotDanger : styles.dotBrand} aria-hidden="true"/>
        {today ? 'Today' : 'With Package Broker'}
        <span className={styles.headingNote}>{today ? 'client keys copied to every machine' : 'client keys stay in one place'}</span>
      </p>
      <div className={styles.wide}><Panel geo={{W: 480, narrow: false}} kind={kind} arrowId={`${idBase}-wide`}/></div>
      <div className={styles.narrow}><Panel geo={{W: 340, narrow: true}} kind={kind} arrowId={`${idBase}-narrow`}/></div>
    </div>
  );
}

export default function KeysMap({className}: {className?: string}) {
  const id = useId();
  const captionId = `${id}-caption`;
  return (
    <figure className={[styles.root, className].filter(Boolean).join(' ')} aria-labelledby={captionId}>
      <Side kind="today" idBase={`${id}-today`}/>
      <div className={styles.divider} aria-hidden="true"><ArrowRight className={styles.divWide} size={20} strokeWidth={2}/><ArrowDown className={styles.divNarrow} size={20} strokeWidth={2}/></div>
      <Side kind="broker" idBase={`${id}-arrow`}/>
      <figcaption id={captionId} className="pb-visually-hidden">
        Today, client Marketplace and vendor keys are copied to every developer laptop, the freelancer's laptop, CI variables and team chat. With Package Broker, the keys are encrypted with a master key you hold, per client project, inside the broker; developers hold one pb_pat_ token, CI holds a pb_svc_ token, and chat holds no client keys.
      </figcaption>
    </figure>
  );
}
