import { Row, Col } from 'antd';

import { StatCard } from '@components/common';

/**
 * Reusable grid layout for rendering a list of StatCards
 * @param {Array} stats - Array of stat objects to pass to StatCard. Custom colProps can be provided.
 * @param {Array | number} gutter - Gutter for the Row. Defaults to [16, 16]
 * @param {object} defaultColProps - Default span for Cols. Defaults to { xs: 24, sm: 12, lg: 6 }
 */
interface StatCardsGridProps {
    stats?: any[];
    gutter?: any;
    defaultColProps?: any;
    style?: React.CSSProperties | any;
    className?: string;
}

/**
 *
 * @param root0
 * @param root0.stats
 * @param root0.gutter
 * @param root0.defaultColProps
 * @param root0.style
 * @param root0.className
 */
export default function StatCardsGrid({
    stats = [],
    gutter = [16, 16],
    defaultColProps = { xs: 24, sm: 12, lg: 6 },
    style,
    className,
}: StatCardsGridProps) {
    if (!stats || stats.length === 0) return null;

    return (
        <Row gutter={gutter} style={style} className={className}>
            {stats.map((stat, index) => {
                const { colProps, ...cardProps } = stat;
                const currentColProps = colProps || defaultColProps;
                return (
                    <Col key={index} {...currentColProps}>
                        <StatCard {...cardProps} />
                    </Col>
                );
            })}
        </Row>
    );
}
