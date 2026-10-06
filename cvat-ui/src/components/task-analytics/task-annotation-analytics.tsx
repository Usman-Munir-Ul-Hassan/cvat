// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'antd/lib/grid';
import Spin from 'antd/lib/spin';
import Alert from 'antd/lib/alert';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Typography from 'antd/lib/typography';
import Table from 'antd/lib/table';
import { ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface AnnotationCount {
    label: string;
    count: number;
}

interface Props {
    taskId: number;
}

function TaskAnnotationAnalytics({ taskId }: Props): JSX.Element {
    const [counts, setCounts] = useState<AnnotationCount[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/test/tasks/${taskId}/counts/`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Request failed with HTTP status ${response.status}`);
            }
            const data: AnnotationCount[] = await response.json();
            setCounts(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load annotation counts.');
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size='large' tip='Loading annotation counts...' />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px 0' }}>
                <Alert
                    type='error'
                    message='Failed to load annotation counts'
                    description={error}
                    showIcon
                    action={
                        <Button size='small' danger onClick={fetchCounts} icon={<ReloadOutlined />}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!counts || counts.length === 0) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Empty description='No annotations found for this task' />
            </div>
        );
    }

    const totalAnnotations = counts.reduce((acc, curr) => acc + curr.count, 0);

    const columns = [
        {
            title: 'Class Label',
            dataIndex: 'label',
            key: 'label',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
            sorter: (a: AnnotationCount, b: AnnotationCount) => a.count - b.count,
        },
    ];

    return (
        <Card
            title={
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>
                            Annotation Analytics (Task #{taskId})
                        </Title>
                    </Col>
                    <Col>
                        <Text type='secondary'>
                            Total Annotations: <strong>{totalAnnotations}</strong> across {counts.length} classes
                        </Text>
                    </Col>
                </Row>
            }
            extra={
                <Button icon={<ReloadOutlined />} onClick={fetchCounts}>
                    Refresh
                </Button>
            }
        >
            <Table
                dataSource={counts.map((item, index) => ({ ...item, key: index }))}
                columns={columns}
                pagination={false}
                size='middle'
            />
        </Card>
    );
}

export default React.memo(TaskAnnotationAnalytics);
