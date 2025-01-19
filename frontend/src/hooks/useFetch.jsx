import { useEffect, useState } from "react";
import { BACKEND_URL } from "../utils/constants";

export default function useFetch(apiEndpoint) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(BACKEND_URL + apiEndpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || `Failed to fetch data from ${apiEndpoint}`);
                }

                setData(result.data);
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, [apiEndpoint]);

    return { data, error };
}