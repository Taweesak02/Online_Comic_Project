import { useEffect, useState } from "react";
import { getHomeRanking } from "../services/homeApi";

export default function useHomeRanking(ranking) {
  const [state, setState] = useState({ comics: [], loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const comics = await getHomeRanking(ranking, { signal: controller.signal });

        if (!controller.signal.aborted)
          setState({ comics, loading: false, error: "" });

      } catch {
        if (!controller.signal.aborted)
          setState({
            comics: [],
            loading: false,
            error: "ไม่สามารถโหลดการ์ตูนได้ กรุณาลองอีกครั้ง",
          });
      }
    };

    load();
    return () => controller.abort();
  }, [ranking, attempt]);

  const retry = () => {
    setState({ comics: [], loading: true, error: "" });
    setAttempt((value) => value + 1);
  };

  return { state, retry };
}
