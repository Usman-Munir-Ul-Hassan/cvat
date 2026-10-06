// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { useSelector } from 'react-redux';

import config from 'config';
import { Project, Task, Job } from 'cvat-core-wrapper';
import { CombinedState } from 'reducers';
import TaskAnnotationAnalytics from 'components/task-analytics/task-annotation-analytics';
import { TimePeriod } from '.';

interface Props {
    resource: Project | Task | Job;
    timePeriod: TimePeriod | null;
}

function AnalyticsReportContent(props: Props): JSX.Element {
    const { resource } = props;
    if (resource instanceof Task) {
        return <TaskAnnotationAnalytics taskId={resource.id} />;
    }

    return (
        <PaidFeaturePlaceholder featureDescription={config.PAID_PLACEHOLDER_CONFIG.features.analyticsReport} />
    );
}

function AnalyticsReportContentWrap(props: Readonly<Props>): JSX.Element {
    const overrides = useSelector(
        (state: CombinedState) => state.plugins.overridableComponents.analyticsReportPage.content,
    );

    if (overrides.length) {
        const [Component] = overrides.slice(-1);
        return <Component {...props} />;
    }

    return <AnalyticsReportContent />;
}

export default React.memo(AnalyticsReportContentWrap);
