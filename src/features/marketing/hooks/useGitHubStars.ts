import { useEffect, useState } from "react";

const CACHE_KEY = "optikk_github_stars_cache";
const CACHE_TIME_KEY = "optikk_github_stars_cache_time";
const ONE_HOUR = 60 * 60 * 1000;

interface RepoData {
  name: string;
  stargazers_count: number;
}

export function useGitHubStars() {
  const [stars, setStars] = useState<Record<string, number>>({
    "optikk-frontend": 0,
    "optikk-backend": 0,
    scheduler: 0,
    "opentelemetry-java": 0,
    "opentelemetry-demo": 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session storage cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
      if (cached && cacheTime && Date.now() - Number(cacheTime) < ONE_HOUR) {
        setStars(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
    } catch (e) {}

    let active = true;
    fetch("https://api.github.com/orgs/optikksense/repos")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch Github stars");
        return res.json() as Promise<RepoData[]>;
      })
      .then((data) => {
        if (!active) return;
        const newStars: Record<string, number> = {
          "optikk-frontend": 0,
          "optikk-backend": 0,
          scheduler: 0,
          "opentelemetry-java": 0,
          "opentelemetry-demo": 0,
        };
        data.forEach((repo) => {
          if (repo?.name) {
            newStars[repo.name] = repo.stargazers_count || 0;
          }
        });
        setStars(newStars);
        setIsLoading(false);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(newStars));
          sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (e) {}
      })
      .catch(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  return { stars, totalStars, isLoading };
}
