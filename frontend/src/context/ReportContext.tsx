import React from "react";

export const ReportContext = React.createContext<{
    usedQuotes: Set<string>;
    markQuoteUsed: (quote: string) => void;
}>({
    usedQuotes: new Set(),
    markQuoteUsed: () => {},
});
