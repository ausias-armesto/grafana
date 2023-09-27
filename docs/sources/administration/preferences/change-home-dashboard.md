+++
title = "Change home dashboard"
description = "How to replace the default home dashboard"
keywords = ["grafana", "configuration", "documentation", "home"]
aliases = ["/docs/grafana/v7.4/administration/change-home-dashboard/"]
weight = 300
+++

# Change the default home dashboard

The home dashboard you set is the one all users will see by default when they log in. You can set the home dashboard for the server, an organization, a team, or your personal user account. This topic provides instructions for each task.

{{< docs/shared lookup="preferences/some-tasks-require-permissions.md" source="grafana" version="<GRAFANA VERSION>" >}}

## Navigate to the home dashboard

The home dashboard is the first dashboard a user sees when they sign in to Grafana. You can also navigate to the home dashboard manually.

1. Hover your cursor over the **Dashboards** (four squares) icon.
1. Click **Home**.

## Set the home dashboard for the server

Users with the Grafana Server Admin flag on their account or access to the configuration file can define a JSON file to use as the home dashboard for all users on the server.

### [Optional] Convert an existing dashboard into a JSON file

1. Navigate to the page of the dashboard you want to use as the home dashboard.
1. Click the **Share dashboard** icon next to the dashboard title.
1. In the Export tab, click **Save to file**. Grafana converts the dashboard to a JSON file and saves it locally.

### Use a JSON file as the home dashboard

1. Save your JSON file somewhere that Grafana can access it. For example, in the Grafana `data` folder of Grafana.
1. Update your configuration file to set the path to the JSON file. Refer to [default_home_dashboard_path]({{< relref "../configuration.md">}}) for more information about modifying the Grafana configuration files.

```ini
[dashboards]
# Path to the default home dashboard. If this value is empty, then Grafana uses StaticRootPath + "dashboards/home.json"
default_home_dashboard_path = data/main-dashboard.json
```

## Set the home dashboard for your organization

Organization administrators can choose a home dashboard for their organization.

{{< docs/list >}}
{{< docs/shared lookup="preferences/navigate-to-the-dashboard-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< docs/shared lookup="preferences/org-preferences-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< docs/shared lookup="preferences/select-home-dashboard-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< /docs/list >}}

## Set home dashboard for your team

Organization administrators and Team Admins can choose a home dashboard for a team.

{{< docs/list >}}
{{< docs/shared lookup="preferences/navigate-to-the-dashboard-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< docs/shared lookup="manage-users/view-team-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
1. Click on the team that you want to change the home dashboard for and then navigate to the **Settings** tab.
{{< docs/shared lookup="preferences/select-home-dashboard-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< /docs/list >}}

## Set your personal home dashboard

You can choose your own personal home dashboard. This setting overrides all home dashboards set at higher levels.

{{< docs/list >}}
{{< docs/shared lookup="preferences/navigate-to-the-dashboard-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< docs/shared lookup="preferences/navigate-user-preferences-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< docs/shared lookup="preferences/select-home-dashboard-list.md" source="grafana" version="<GRAFANA VERSION>" >}}
{{< /docs/list >}}