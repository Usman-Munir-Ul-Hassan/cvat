# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cvat.apps.engine.models import LabeledShape, Task


class TaskAnnotationCountsView(APIView):
    """
    Returns per-class annotation counts for a given task.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, pk=None):
        if not Task.objects.filter(id=pk).exists():
            return Response(
                {"detail": f"Task {pk} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        counts = (
            LabeledShape.objects.filter(job__segment__task_id=pk)
            .values("label__name")
            .annotate(count=Count("id"))
            .order_by("-count", "label__name")
        )

        data = [
            {"label": item["label__name"], "count": item["count"]}
            for item in counts
        ]

        return Response(data, status=status.HTTP_200_OK)
