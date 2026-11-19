import { useActivity } from '../hooks/useActivity';

const history = { visit: 3000, download: 270 };

export default function ActivityCount({ kind }) {
  const activity = useActivity();
  const baseline = history[kind];
  const count = baseline + (activity[kind] ?? 0);
  const label = kind === 'visit' ? 'visits' : 'download starts';
  const title = 'Includes ' + baseline.toLocaleString() + ' previously reported ' + label + '. Refreshes every 12 seconds.';
  return <span className="activity-count" title={title}>
    <strong>{count.toLocaleString()}{kind === 'visit' && '+'}</strong>
    <small data-live={activity.live}>{activity.live ? 'Live' : activity[kind] === null ? 'Historical' : 'Last synced'}</small>
  </span>;
}
