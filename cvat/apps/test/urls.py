# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.urls import path

from .views import TaskAnnotationCountsView

urlpatterns = [
    path("tasks/<int:pk>/counts/", TaskAnnotationCountsView.as_view(), name="task-annotation-counts"),
    path("tasks/<int:pk>/counts", TaskAnnotationCountsView.as_view(), name="task-annotation-counts-noslash"),
]
