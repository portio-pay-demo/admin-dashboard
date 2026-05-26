# Changelog

All notable changes to the admin dashboard are documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format. Version numbers align with the `version` field in `package.json`.

## Unreleased

### Added

- Changelog file for tracking future user-facing and operational changes.

## 3.1.2 - 2026-05-26

### Added

- Merchant onboarding and configuration management workflows.
- Transaction search and manual review tools.
- Real-time metrics dashboard for platform monitoring.
- Role-based access control for Admin, Support, Finance, and Read-only users.

### Changed

- Real-time metrics now use event-driven cache invalidation for fresher dashboard data.
- Session management now supports activity-based renewal for internal operators.

### Security

- CSRF protection is enforced on state-mutating forms.
