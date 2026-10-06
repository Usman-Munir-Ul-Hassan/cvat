# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cvat.apps.engine.models import LabeledShape, Task
from cvat.apps.engine.permissions import TaskPermission


class TaskAnnotationCountsView(APIView):
    """
    Returns per-class annotation counts for a given task.
    Requires authentication and task view permission.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        task = Task.objects.filter(id=pk).first()
        if not task:
            return Response(
                {"detail": f"Task {pk} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        perm = TaskPermission.create_scope_view(request, task)
        if not perm.check_access().allow:
            return Response(
                {"detail": "You do not have permission to view this task."},
                status=status.HTTP_403_FORBIDDEN,
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
