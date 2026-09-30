import ComicSection from "../../../components/comics/ComicSection";
import useHomeRanking from '../hooks/useHomeRanking';

export default function HomeRanking({ title, ranking }) {
  const { state, retry } = useHomeRanking(ranking);

  return (
    <ComicSection
      title={title}
      comics={state.comics}
      loading={state.loading}
      error={state.error}
      onRetry={retry}
    />
  );
}
