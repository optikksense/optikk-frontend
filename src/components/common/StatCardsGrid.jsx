import { Row, Col } from 'antd';
import StatCard from './StatCard';

/**
 * Reusable grid layout for rendering a list of StatCards
 *
 * @param {Array} stats - Array of stat objects to pass to StatCard. Custom colProps can be provided.
 * @param {Array|Number} gutter - Gutter for the Row. Defaults to [16, 16]
 * @param {Object} defaultColProps - Default span for Cols. Defaults to { xs: 24, sm: 12, lg: 6 }
 */
export default function StatCardsGrid({
    stats = [],
    gutter = [16, 16],
    defaultColProps = { xs: 24, sm: 12, lg: 6 },
    style,
    className
}) {
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
