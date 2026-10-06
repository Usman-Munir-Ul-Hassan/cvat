// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Spin from 'antd/lib/spin';
import Alert from 'antd/lib/alert';
import Empty from 'antd/lib/empty';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Select from 'antd/lib/select';
import Typography from 'antd/lib/typography';
import { ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export interface AnnotationCount {
    label: string;
    count: number;
}

interface Props {
    taskId: number;
}

function TaskAnnotationAnalytics({ taskId }: Props): JSX.Element {
    const history = useHistory();
    const [counts, setCounts] = useState<AnnotationCount[] | null>(null);
    const [shapeType, setShapeType] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);

    const fetchCounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        setErrorStatus(null);
        try {
            const query = shapeType !== 'all' ? `?shape_type=${encodeURIComponent(shapeType)}` : '';
            const response = await fetch(`/api/test/tasks/${taskId}/counts/${query}`);
            if (!response.ok) {
                setErrorStatus(response.status);
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
    }, [taskId, shapeType]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    if (loading) {
        return (
            <Card
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        📊 Annotation Analytics (Task #{taskId})
                    </Title>
                }
            >
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size='large' tip='Loading annotation counts...' />
                </div>
            </Card>
        );
    }

    if (error) {
        const isAuthError = errorStatus === 401 || errorStatus === 403;
        return (
            <Card
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        📊 Annotation Analytics (Task #{taskId})
                    </Title>
                }
            >
                <div style={{ padding: '16px 0' }}>
                    {isAuthError ? (
                        <Alert
                            type='warning'
                            message={`Access Denied (${errorStatus === 401 ? '401 Unauthorized' : '403 Forbidden'})`}
                            description={error}
                            showIcon
                            action={
                                <Button
                                    size='middle'
                                    type='primary'
                                    onClick={() => history.push('/tasks')}
                                    icon={<ArrowLeftOutlined />}
                                >
                                    Back to Tasks
                                </Button>
                            }
                        />
                    ) : (
                        <Alert
                            type='error'
                            message='Failed to load annotation counts'
                            description={error}
                            showIcon
                            action={
                                <Button
                                    size='middle'
                                    danger
                                    type='primary'
                                    onClick={fetchCounts}
                                    icon={<ReloadOutlined />}
                                >
                                    Retry
                                </Button>
                            }
                        />
                    )}
                </div>
            </Card>
        );
    }

    if (!counts || counts.length === 0) {
        return (
            <Card
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        📊 Annotation Analytics (Task #{taskId})
                    </Title>
                }
                extra={
                    <Button icon={<ReloadOutlined />} onClick={fetchCounts}>
                        Refresh
                    </Button>
                }
            >
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <Empty
                        description={
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 500, color: '#595959' }}>
                                    No annotations found for this task
                                </div>
                                <div style={{ color: '#8c8c8c', marginTop: 4, fontSize: 13 }}>
                                    This task contains 0 annotations drawn or imported.
                                </div>
                            </div>
                        }
                    >
                        <Button
                            type='primary'
                            icon={<ArrowLeftOutlined />}
                            style={{ marginTop: 12 }}
                            onClick={() => history.push(`/tasks/${taskId}`)}
                        >
                            Back to Task #{taskId}
                        </Button>
                    </Empty>
                </div>
            </Card>
        );
    }

    const totalAnnotations = counts.reduce((acc, curr) => acc + curr.count, 0);
    const maxCount = Math.max(...counts.map((item) => item.count), 1);

    const colors = [
        '#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d',
        '#722ed1', '#eb2f96', '#fa8c16', '#2f54eb', '#a0d911',
        '#fa541c', '#13a8a8',
    ];

    return (
        <Card
            title={
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>
                            📊 Annotation Analytics (Task #{taskId})
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
            <Title level={5} style={{ marginBottom: 16 }}>Annotation Distribution (Bar Chart)</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {counts.map((item, index) => {
                    const widthPct = Math.max((item.count / maxCount) * 100, 3);
                    const color = colors[index % colors.length];
                    return (
                        <Row key={item.label} align='middle' style={{ minHeight: 28 }}>
                            <Col span={6} style={{ textAlign: 'right', paddingRight: 16 }}>
                                <Text strong style={{ fontSize: 13 }}>{item.label}</Text>
                            </Col>
                            <Col span={15}>
                                <div
                                    style={{
                                        background: '#f5f5f5',
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        height: 24,
                                        position: 'relative',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${widthPct}%`,
                                            backgroundColor: color,
                                            height: '100%',
                                            borderRadius: 4,
                                            transition: 'width 0.4s ease-in-out',
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col span={3} style={{ paddingLeft: 12 }}>
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        color,
                                        fontSize: 13,
                                    }}
                                >
                                    {item.count}
                                </span>
                            </Col>
                        </Row>
                    );
                })}
            </div>
        </Card>
    );
}

export default React.memo(TaskAnnotationAnalytics);
