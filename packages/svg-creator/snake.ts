import { getSnakeLength, snakeToCells } from '@snk/types/snake';
import type { Snake } from '@snk/types/snake';
import type { Color } from '@snk/types/grid';
import type { Point } from '@snk/types/point';
import { t } from './utils';

export type Options = {
  colorDots: Record<Color, string>;
  colorEmpty: string;
  colorBorder: string;
  colorSnake: string;
  sizeCell: number;
  sizeDot: number;
  sizeBorderRadius: number;
};

const percent = (x: number) => (x * 100).toFixed(2);

const lerp = (k: number, a: number, b: number) => (1 - k) * a + k * b;

export const createSnake = (chain: Snake[], { sizeCell, sizeDot }: Options, duration: number) => {
  const snakeN = chain[0] ? getSnakeLength(chain[0]) : 0;

  const snakeParts: Point[][] = Array.from({ length: snakeN }, () => []);

  for (const snake of chain) {
    const cells = snakeToCells(snake);
    for (let i = cells.length; i--; ) snakeParts[i].push(cells[i]);
  }

  const svgElements = snakeParts.map((_, i, { length }) => {
    // compute snake part size
    const dMin = sizeDot * 0.8;
    const dMax = sizeCell * 0.9;
    const iMax = Math.min(4, length);
    const u = (1 - Math.min(i, iMax) / iMax) ** 2;
    const s = lerp(u, dMin, dMax);

    const m = (sizeCell - s) / 2;

    const r = Math.min(4.5, (4 * s) / sizeDot);

    return (
      // h('rect', {
      //   class: `s s${i}`,
      //   x: m.toFixed(1),
      //   y: m.toFixed(1),
      //   width: s.toFixed(1),
      //   height: s.toFixed(1),
      //   rx: r.toFixed(1),
      //   ry: r.toFixed(1),
      // }),
      // 'font-size-adjust': '0.58',
      // 'font-size': '1rem',
      t(
        'text',
        {
          class: `s s${i}`,
          x: m.toFixed(1),
          y: m.toFixed(1),
          width: s.toFixed(1),
          height: s.toFixed(1),
          'font-size': ((i === 0 ? 20 : -2) + s).toFixed(1) + 'px',
          dx: r.toFixed(1),
          dy: r.toFixed(1),
        },
        '👹'
      )
    );
  });

  const transform = ({ x, y }: Point) =>
    `transform:translate(${x * sizeCell}px,${y * sizeCell}px) rotate(${x}deg)`;

  const styles = [
    `.s{ 
      shape-rendering:geometricPrecision;
      fill:var(--cs);
      animation: none ease-out ${duration}ms infinite
    }`,
    ...snakeParts.map((positions, i) => {
      const id = `s${i}`;
      const animationName = id;
      return [
        `@keyframes ${animationName} {` +
          removeInterpolatedPositions(positions.map((tr, i, { length }) => ({ ...tr, t: i / length })))
            .map((p) => `${percent(p.t)}%{${transform(p)}}`)
            .join('') +
          '}',

        `.s.${id}{${transform(positions[0])};animation-name: ${animationName}}`,
      ];
    }),
  ].flat();

  return { svgElements, styles };
};

const removeInterpolatedPositions = <T extends Point>(arr: T[]) =>
  arr.filter((u, i, arr) => {
    if (i - 1 < 0 || i + 1 >= arr.length) return true;

    const a = arr[i - 1];
    const b = arr[i + 1];

    const ex = (a.x + b.x) / 2;
    const ey = (a.y + b.y) / 2;

    // return true;
    return !(Math.abs(ex - u.x) < 0.01 && Math.abs(ey - u.y) < 0.01);
  });
